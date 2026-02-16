const { Shipment, ShipmentTracking, Order, User } = require('../models');

const seedShipments = async () => {
  try {
    console.log('🚚 Seeding shipments...');

    // Get existing orders
    const orders = await Order.findAll({
      include: [{ model: User, as: 'user' }],
      limit: 10
    });

    if (orders.length === 0) {
      console.log('⚠️  No orders found. Please create orders first.');
      return;
    }

    const carriers = ['Correo Argentino', 'Andreani', 'OCA', 'DHL', 'FedEx'];
    const shipmentStatuses = [
      'pending',
      'label_created',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'failed_delivery'
    ];

    const shipmentsData = [];
    const trackingData = [];

    for (let i = 0; i < Math.min(orders.length, 8); i++) {
      const order = orders[i];
      const carrier = carriers[Math.floor(Math.random() * carriers.length)];
      const status = shipmentStatuses[Math.floor(Math.random() * shipmentStatuses.length)];
      
      // Generate tracking number
      const trackingNumber = `${carrier.substring(0, 3).toUpperCase()}${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Calculate dates
      const createdDate = new Date(order.createdAt);
      const shippedDate = new Date(createdDate);
      shippedDate.setDate(shippedDate.getDate() + 1);
      
      const estimatedDelivery = new Date(shippedDate);
      estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 5) + 3);
      
      const deliveredDate = status === 'delivered' ? new Date(shippedDate) : null;
      if (deliveredDate) {
        deliveredDate.setDate(deliveredDate.getDate() + Math.floor(Math.random() * 4) + 2);
      }

      const shipment = {
        id: require('uuid').v4(),
        orderId: order.id,
        trackingNumber,
        carrier,
        carrierService: ['Standard', 'Express', 'Next Day'][Math.floor(Math.random() * 3)],
        status,
        shippingCost: parseFloat((Math.random() * 1000 + 500).toFixed(2)),
        weight: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        dimensions: {
          length: Math.floor(Math.random() * 30) + 20,
          width: Math.floor(Math.random() * 30) + 20,
          height: Math.floor(Math.random() * 30) + 10
        },
        shippingAddress: order.shippingAddress,
        originAddress: {
          street: 'Av. Corrientes 1234',
          city: 'Buenos Aires',
          state: 'CABA',
          postalCode: '1043',
          country: 'Argentina'
        },
        estimatedDeliveryDate: estimatedDelivery,
        shippedAt: ['in_transit', 'out_for_delivery', 'delivered'].includes(status) ? shippedDate : null,
        deliveredAt: deliveredDate,
        packageType: ['Box', 'Envelope', 'Pallet'][Math.floor(Math.random() * 3)],
        numberOfPackages: Math.floor(Math.random() * 3) + 1,
        insuranceAmount: Math.random() > 0.5 ? parseFloat((Math.random() * 5000 + 1000).toFixed(2)) : 0,
        notes: `Envío para orden ${order.orderNumber}`,
        trackingUrl: `https://${carrier.toLowerCase().replace(' ', '')}.com/track/${trackingNumber}`,
        signatureRequired: Math.random() > 0.5,
        attemptedDeliveries: status === 'failed_delivery' ? Math.floor(Math.random() * 2) + 1 : 0,
        lastAttemptDate: status === 'failed_delivery' ? new Date() : null,
        createdAt: createdDate,
        updatedAt: new Date()
      };

      shipmentsData.push(shipment);

      // Create tracking history based on status
      const trackingEvents = generateTrackingEvents(shipment.id, status, createdDate, shippedDate, deliveredDate);
      trackingData.push(...trackingEvents);
    }

    // Bulk insert shipments
    await Shipment.bulkCreate(shipmentsData);
    console.log(`✅ Created ${shipmentsData.length} shipments`);

    // Bulk insert tracking events
    await ShipmentTracking.bulkCreate(trackingData);
    console.log(`✅ Created ${trackingData.length} tracking events`);

    // Update orders with tracking numbers
    for (const shipment of shipmentsData) {
      await Order.update(
        { 
          trackingNumber: shipment.trackingNumber,
          status: getOrderStatusFromShipment(shipment.status)
        },
        { where: { id: shipment.orderId } }
      );
    }
    console.log('✅ Updated orders with tracking numbers');

    console.log('🎉 Shipments seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding shipments:', error);
    throw error;
  }
};

const generateTrackingEvents = (shipmentId, status, createdDate, shippedDate, deliveredDate) => {
  const events = [];
  const uuid = require('uuid');

  // Event 1: Label created
  events.push({
    id: uuid.v4(),
    shipmentId,
    status: 'label_created',
    location: 'Centro de Distribución - Buenos Aires',
    description: 'Etiqueta de envío creada',
    timestamp: createdDate,
    isPublic: true,
    createdAt: createdDate,
    updatedAt: createdDate
  });

  if (['picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(status)) {
    const pickupDate = new Date(createdDate);
    pickupDate.setHours(pickupDate.getHours() + 6);
    
    events.push({
      id: uuid.v4(),
      shipmentId,
      status: 'picked_up',
      location: 'Centro de Distribución - Buenos Aires',
      description: 'Paquete recogido por el transportista',
      timestamp: pickupDate,
      isPublic: true,
      createdAt: pickupDate,
      updatedAt: pickupDate
    });
  }

  if (['in_transit', 'out_for_delivery', 'delivered'].includes(status)) {
    const transitDate = new Date(shippedDate);
    
    events.push({
      id: uuid.v4(),
      shipmentId,
      status: 'in_transit',
      location: 'En tránsito',
      description: 'Paquete en camino al destino',
      timestamp: transitDate,
      isPublic: true,
      createdAt: transitDate,
      updatedAt: transitDate
    });

    // Add intermediate transit event
    const midTransit = new Date(transitDate);
    midTransit.setDate(midTransit.getDate() + 1);
    
    events.push({
      id: uuid.v4(),
      shipmentId,
      status: 'in_transit',
      location: 'Centro de Clasificación - Córdoba',
      description: 'Paquete procesado en centro de clasificación',
      timestamp: midTransit,
      isPublic: true,
      createdAt: midTransit,
      updatedAt: midTransit
    });
  }

  if (['out_for_delivery', 'delivered'].includes(status)) {
    const outForDeliveryDate = deliveredDate ? new Date(deliveredDate) : new Date();
    outForDeliveryDate.setHours(8, 0, 0, 0);
    
    events.push({
      id: uuid.v4(),
      shipmentId,
      status: 'out_for_delivery',
      location: 'Centro de Reparto Local',
      description: 'Paquete en reparto - Será entregado hoy',
      timestamp: outForDeliveryDate,
      isPublic: true,
      createdAt: outForDeliveryDate,
      updatedAt: outForDeliveryDate
    });
  }

  if (status === 'delivered' && deliveredDate) {
    const finalDelivery = new Date(deliveredDate);
    finalDelivery.setHours(14, 30, 0, 0);
    
    events.push({
      id: uuid.v4(),
      shipmentId,
      status: 'delivered',
      location: 'Domicilio del Cliente',
      description: 'Paquete entregado exitosamente',
      timestamp: finalDelivery,
      carrierMessage: 'Entregado y firmado por el destinatario',
      isPublic: true,
      createdAt: finalDelivery,
      updatedAt: finalDelivery
    });
  }

  if (status === 'failed_delivery') {
    const failedDate = new Date();
    failedDate.setHours(12, 0, 0, 0);
    
    events.push({
      id: uuid.v4(),
      shipmentId,
      status: 'failed_delivery',
      location: 'Domicilio del Cliente',
      description: 'Intento de entrega fallido - Cliente ausente',
      timestamp: failedDate,
      carrierMessage: 'Se dejó aviso. Nuevo intento programado para mañana.',
      isPublic: true,
      createdAt: failedDate,
      updatedAt: failedDate
    });
  }

  return events;
};

const getOrderStatusFromShipment = (shipmentStatus) => {
  const statusMap = {
    'pending': 'processing',
    'label_created': 'processing',
    'picked_up': 'shipped',
    'in_transit': 'shipped',
    'out_for_delivery': 'shipped',
    'delivered': 'delivered',
    'failed_delivery': 'shipped',
    'returned': 'processing',
    'cancelled': 'cancelled'
  };
  return statusMap[shipmentStatus] || 'processing';
};

module.exports = { seedShipments };
