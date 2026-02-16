const { Coupon, CouponUsage, User, Order, sequelize } = require('../models');
const { Op } = require('sequelize');

// Validar y aplicar cupón
const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal, cartItems = [] } = req.body;
    const userId = req.user.id;
    
    // Buscar cupón
    const coupon = await Coupon.findOne({
      where: { 
        code: code.toUpperCase(),
        isActive: true
      }
    });

    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cupón no encontrado o inactivo' 
      });
    }

    // Validar fecha
    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({ 
        success: false, 
        message: 'Este cupón aún no está disponible' 
      });
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return res.status(400).json({ 
        success: false, 
        message: 'Este cupón ha expirado' 
      });
    }

    // Validar monto mínimo
    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      return res.status(400).json({ 
        success: false, 
        message: `El monto mínimo de compra es $${coupon.minPurchase}` 
      });
    }

    // Validar límite de usos
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ 
        success: false, 
        message: 'Este cupón ha alcanzado su límite de usos' 
      });
    }

    // Validar límite por usuario
    if (coupon.usageLimitPerUser) {
      const userUsageCount = await CouponUsage.count({
        where: { couponId: coupon.id, userId }
      });
      if (userUsageCount >= coupon.usageLimitPerUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Has alcanzado el límite de usos para este cupón' 
        });
      }
    }

    // Validar primera compra
    if (coupon.firstPurchaseOnly) {
      const orderCount = await Order.count({ where: { userId } });
      if (orderCount > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Este cupón es solo para primera compra' 
        });
      }
    }

    // Validar productos aplicables
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const applicableItems = cartItems.filter(item => 
        coupon.applicableProducts.includes(item.productId)
      );
      if (applicableItems.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Este cupón no aplica a los productos en tu carrito' 
        });
      }
    }

    // Validar productos excluidos
    if (coupon.excludedProducts && coupon.excludedProducts.length > 0) {
      const hasExcluded = cartItems.some(item => 
        coupon.excludedProducts.includes(item.productId)
      );
      if (hasExcluded) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tu carrito contiene productos excluidos de este cupón' 
        });
      }
    }

    // Calcular descuento
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.min(discountAmount, cartTotal)
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al validar cupón' 
    });
  }
};

// Aplicar cupón (llamado después del pedido)
const applyCoupon = async (req, res) => {
  try {
    const { couponId, orderId, discountApplied } = req.body;
    const userId = req.user.id;

    // Crear registro de uso
    await CouponUsage.create({
      couponId,
      userId,
      orderId,
      discountApplied
    });

    // Incrementar contador
    await Coupon.increment('usedCount', { where: { id: couponId } });

    res.json({ success: true, message: 'Cupón aplicado exitosamente' });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al aplicar cupón' 
    });
  }
};

// Obtener cupones públicos
const getPublicCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.findAll({
      where: {
        isActive: true,
        isPublic: true, // Solo cupones públicos
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
        [Op.or]: [
          { usageLimit: null },
          sequelize.where(
            sequelize.col('usedCount'),
            Op.lt,
            sequelize.col('usageLimit')
          )
        ]
      },
      attributes: ['id', 'code', 'description', 'discountType', 'discountValue', 'minPurchase', 'maxDiscount', 'endDate'],
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    res.json({ coupons });
  } catch (error) {
    console.error('Error fetching public coupons:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener cupones' 
    });
  }
};

// ADMIN: Obtener todos los cupones
const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status !== undefined) {
      where.isActive = status === 'true';
    }

    const { count, rows } = await Coupon.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    res.json({
      coupons: rows,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener cupones' 
    });
  }
};

// ADMIN: Obtener un cupón
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });

    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cupón no encontrado' 
      });
    }

    res.json({ coupon });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener cupón' 
    });
  }
};

// ADMIN: Crear cupón
const createCoupon = async (req, res) => {
  try {
    const couponData = {
      ...req.body,
      code: req.body.code.toUpperCase(),
      createdBy: req.user.id
    };

    const coupon = await Coupon.create(couponData);
    res.status(201).json({ 
      success: true, 
      message: 'Cupón creado exitosamente',
      coupon 
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un cupón con ese código' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear cupón' 
    });
  }
};

// ADMIN: Actualizar cupón
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cupón no encontrado' 
      });
    }

    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }

    await coupon.update(req.body);
    
    res.json({ 
      success: true, 
      message: 'Cupón actualizado exitosamente',
      coupon 
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un cupón con ese código' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar cupón' 
    });
  }
};

// ADMIN: Eliminar cupón
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cupón no encontrado' 
      });
    }

    // Verificar si tiene usos
    const usageCount = await CouponUsage.count({ where: { couponId: coupon.id } });
    if (usageCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se puede eliminar un cupón que ha sido usado. Desactívalo en su lugar.' 
      });
    }

    await coupon.destroy();
    
    res.json({ 
      success: true, 
      message: 'Cupón eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar cupón' 
    });
  }
};

// ADMIN: Toggle estado del cupón
const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cupón no encontrado' 
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.json({ 
      success: true, 
      message: `Cupón ${coupon.isActive ? 'activado' : 'desactivado'} exitosamente`,
      coupon 
    });
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cambiar estado del cupón' 
    });
  }
};

// ADMIN: Estadísticas de cupones
const getCouponStats = async (req, res) => {
  try {
    const { couponId } = req.params;
    
    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cupón no encontrado' 
      });
    }

    const usages = await CouponUsage.findAll({
      where: { couponId },
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Order, attributes: ['id', 'total', 'createdAt'] }
      ],
      order: [['usedAt', 'DESC']]
    });

    const totalDiscount = usages.reduce((sum, usage) => sum + parseFloat(usage.discountApplied), 0);
    const uniqueUsers = new Set(usages.map(u => u.userId)).size;

    res.json({
      coupon,
      stats: {
        totalUses: usages.length,
        uniqueUsers,
        totalDiscount,
        averageDiscount: usages.length > 0 ? totalDiscount / usages.length : 0,
        usageRate: coupon.usageLimit ? (usages.length / coupon.usageLimit) * 100 : null
      },
      recentUsages: usages.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas' 
    });
  }
};

module.exports = {
  validateCoupon,
  applyCoupon,
  getPublicCoupons,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponStats
};
