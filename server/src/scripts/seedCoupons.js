const { Coupon } = require('../models');

const seedCoupons = async () => {
  try {
    // Crear cupones de ejemplo
    const coupons = [
      {
        code: 'BIENVENIDO10',
        description: '¡Obtén 10% de descuento en tu primera compra!',
        discountType: 'percentage',
        discountValue: 10,
        minPurchase: 100,
        maxDiscount: 50,
        usageLimit: 100,
        usageLimitPerUser: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        isActive: true,
        firstPurchaseOnly: true,
        stackable: false
      },
      {
        code: 'ENVIOGRATIS',
        description: 'Envío gratis en compras mayores a $500',
        discountType: 'freeShipping',
        discountValue: 0,
        minPurchase: 500,
        usageLimit: null,
        usageLimitPerUser: null,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días
        isActive: true,
        firstPurchaseOnly: false,
        stackable: true
      },
      {
        code: 'SUPER20',
        description: 'Super descuento del 20% en toda la tienda',
        discountType: 'percentage',
        discountValue: 20,
        minPurchase: 200,
        maxDiscount: 100,
        usageLimit: 50,
        usageLimitPerUser: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        isActive: true,
        firstPurchaseOnly: false,
        stackable: false
      },
      {
        code: 'DESCUENTO50',
        description: '$50 de descuento en tu próxima compra',
        discountType: 'fixed',
        discountValue: 50,
        minPurchase: 300,
        usageLimit: 200,
        usageLimitPerUser: 2,
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
        isActive: true,
        firstPurchaseOnly: false,
        stackable: false
      }
    ];

    for (const couponData of coupons) {
      const existing = await Coupon.findOne({ where: { code: couponData.code } });
      if (!existing) {
        await Coupon.create(couponData);
        console.log(`✓ Cupón ${couponData.code} creado`);
      } else {
        console.log(`- Cupón ${couponData.code} ya existe`);
      }
    }

    console.log('\n✓ Cupones de ejemplo creados exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('Error creando cupones:', error);
    process.exit(1);
  }
};

seedCoupons();
