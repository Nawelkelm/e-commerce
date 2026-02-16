const { sequelize, Order, User, OrderItem, Product, Invoice } = require('../models');
const InvoicePDFService = require('../services/invoicePDFService');
const path = require('path');

async function regenerateAllPDFs() {
  try {
    console.log('🔄 Regenerando PDFs de todas las facturas...');

    const invoices = await Invoice.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            },
            {
              model: OrderItem,
              as: 'items',
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'name', 'sku', 'description']
                }
              ]
            }
          ]
        }
      ]
    });

    console.log(`📄 Encontradas ${invoices.length} facturas`);

    let successCount = 0;
    let errorCount = 0;

    for (const invoice of invoices) {
      try {
        // Generar path del PDF
        const uploadsDir = path.join(__dirname, '../../uploads/invoices');
        const fileName = `${invoice.invoiceNumber}.pdf`;
        const pdfPath = path.join(uploadsDir, fileName);
        
        // Generar PDF
        await InvoicePDFService.generateInvoicePDF(invoice.toJSON(), pdfPath);
        
        // Actualizar URL relativa en la BD
        const pdfUrl = `/uploads/invoices/${fileName}`;
        await invoice.update({ pdfUrl });
        
        console.log(`✅ PDF regenerado: ${invoice.invoiceNumber} -> ${pdfUrl}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error regenerando PDF para ${invoice.invoiceNumber}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✨ Regeneración completada!`);
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
  } catch (error) {
    console.error('Error en regeneración de PDFs:', error);
    throw error;
  }
}

async function seedInvoices() {
  try {
    console.log('🌱 Iniciando seed de facturas...');

    // Buscar órdenes pagadas que no tengan factura
    const orders = await Order.findAll({
      where: {
        paymentStatus: 'paid',
        status: 'delivered'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'address']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'description', 'price']
            }
          ]
        }
      ],
      limit: 10
    });

    console.log(`📦 Encontradas ${orders.length} órdenes pagadas`);

    if (orders.length < 5) {
      console.log(`⚠️  Solo hay ${orders.length} órdenes. Creando más órdenes de prueba...`);
      await createTestOrders();
      return seedInvoices(); // Volver a ejecutar después de crear órdenes
    }

    // Verificar cuántas facturas ya existen
    const existingInvoicesCount = await Invoice.count();
    console.log(`📄 Facturas existentes: ${existingInvoicesCount}`);

    let createdCount = 0;

    for (const order of orders) {
      try {
        // Verificar si ya tiene factura
        const existingInvoice = await Invoice.findOne({
          where: { orderId: order.id }
        });

        if (existingInvoice) {
          console.log(`⏭️  Orden ${order.orderNumber} ya tiene factura (${existingInvoice.invoiceNumber})`);
          continue;
        }

        // Generar número de factura
        const year = new Date().getFullYear();
        const lastInvoice = await Invoice.findOne({
          where: {
            invoiceNumber: {
              [sequelize.Sequelize.Op.like]: `FAC-${year}-%`
            }
          },
          order: [['createdAt', 'DESC']]
        });

        let sequence = 1;
        if (lastInvoice) {
          const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
          sequence = lastNumber + 1;
        }

        const invoiceNumber = `FAC-${year}-${String(sequence).padStart(6, '0')}`;

        // Calcular subtotal y impuestos
        const subtotal = parseFloat(order.subtotal || order.totalAmount);
        const tax = parseFloat(order.tax || (subtotal * 0.21)); // IVA 21%
        const totalAmount = parseFloat(order.totalAmount);

        // Preparar items de la factura
        const invoiceItems = order.items.map(item => ({
          productId: item.productId,
          description: item.product.name,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseFloat(item.totalPrice)
        }));

        // Crear la factura
        const invoice = await Invoice.create({
          invoiceNumber,
          orderId: order.id,
          userId: order.userId,
          customerName: `${order.user.firstName} ${order.user.lastName}`,
          customerEmail: order.user.email,
          customerPhone: order.user.phone || 'No especificado',
          customerAddress: order.user.address || order.shippingAddress || 'No especificado',
          items: invoiceItems,
          subtotal,
          taxRate: 21.00,
          tax,
          discount: 0,
          shipping: parseFloat(order.shippingCost || 0),
          total: totalAmount,
          totalAmount,
          paymentMethod: order.paymentMethod || 'mercadopago',
          paymentId: order.paymentId || null,
          paymentDate: order.updatedAt,
          status: 'paid',
          issueDate: order.createdAt,
          dueDate: new Date(order.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 días
          paidDate: order.updatedAt,
          notes: 'Factura generada automáticamente por el sistema'
        });

        console.log(`✅ Factura creada: ${invoiceNumber} para orden ${order.orderNumber}`);

        // Generar PDF - Recargar factura con todas las relaciones necesarias
        try {
          const invoiceComplete = await Invoice.findByPk(invoice.id, {
            include: [
              {
                model: Order,
                as: 'order',
                include: [
                  {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
                  },
                  {
                    model: OrderItem,
                    as: 'items',
                    include: [
                      {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'sku', 'description']
                      }
                    ]
                  }
                ]
              }
            ]
          });

          // Generar path del PDF
          const uploadsDir = path.join(__dirname, '../../uploads/invoices');
          const fileName = `${invoiceNumber}.pdf`;
          const fullPath = path.join(uploadsDir, fileName);
          
          // Generar PDF
          await InvoicePDFService.generateInvoicePDF(invoiceComplete.toJSON(), fullPath);
          
          // Actualizar factura con la URL relativa
          const pdfUrl = `/uploads/invoices/${fileName}`;
          await invoice.update({ pdfUrl });
          
          console.log(`📄 PDF generado: ${pdfUrl}`);
          createdCount++;
        } catch (pdfError) {
          console.error(`❌ Error generando PDF para factura ${invoiceNumber}:`, pdfError.message);
        }

      } catch (error) {
        console.error(`❌ Error creando factura para orden ${order.orderNumber}:`, error.message);
      }
    }

    console.log(`\n✨ Seed completado!`);
    console.log(`📊 Facturas creadas: ${createdCount}`);
    console.log(`📁 Total de facturas en BD: ${await Invoice.count()}`);

  } catch (error) {
    console.error('❌ Error en seed de facturas:', error);
    throw error;
  }
}

async function createTestOrders() {
  console.log('🔨 Creando órdenes de prueba...');
  
  // Buscar un usuario admin
  const adminUser = await User.findOne({
    where: { role: 'admin' }
  });

  if (!adminUser) {
    throw new Error('No se encontró usuario admin');
  }

  // Buscar productos
  const products = await Product.findAll({ limit: 5 });

  if (products.length === 0) {
    throw new Error('No hay productos en la base de datos');
  }

  // Crear 5 órdenes de prueba
  for (let i = 0; i < 5; i++) {
    const orderNumber = `ORD-${Date.now()}-${i}`;
    const selectedProducts = products.slice(0, Math.floor(Math.random() * 3) + 1);
    
    let subtotal = 0;
    const orderItems = [];

    for (const product of selectedProducts) {
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = parseFloat(product.price);
      const totalPrice = unitPrice * quantity;
      
      subtotal += totalPrice;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku || `SKU-${product.id}`,
        quantity,
        unitPrice,
        totalPrice
      });
    }

    const tax = subtotal * 0.21;
    const totalAmount = subtotal + tax;

    // Crear orden
    const order = await Order.create({
      orderNumber,
      userId: adminUser.id,
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'mercadopago',
      subtotal,
      tax,
      shippingCost: 0,
      total: totalAmount, // Agregar campo total
      totalAmount,
      shippingAddress: JSON.stringify({
        street: 'Calle Falsa 123',
        city: 'Buenos Aires',
        state: 'CABA',
        zipCode: '1000',
        country: 'Argentina'
      })
    });

    // Crear items de la orden
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item
      });
    }

    console.log(`✅ Orden creada: ${orderNumber}`);
  }

  console.log('✨ Órdenes de prueba creadas');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedInvoices()
    .then(() => {
      console.log('✅ Seed completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seed:', error);
      process.exit(1);
    });
}

module.exports = { seedInvoices, regenerateAllPDFs };
