'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Coupons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Código único del cupón (ej: VERANO2025)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del cupón para mostrar al usuario'
      },
      discountType: {
        type: Sequelize.ENUM('percentage', 'fixed', 'freeShipping'),
        allowNull: false,
        defaultValue: 'percentage',
        comment: 'Tipo de descuento: porcentaje, monto fijo, envío gratis'
      },
      discountValue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Valor del descuento (% o monto)'
      },
      minPurchase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Compra mínima requerida para usar el cupón'
      },
      maxDiscount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Descuento máximo para cupones de porcentaje'
      },
      usageLimit: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Límite de usos totales (null = ilimitado)'
      },
      usageLimitPerUser: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Límite de usos por usuario'
      },
      usedCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Contador de usos del cupón'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de inicio de validez'
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de fin de validez'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si el cupón está activo'
      },
      applicableCategories: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true,
        comment: 'IDs de categorías aplicables (null = todas)'
      },
      applicableProducts: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true,
        comment: 'IDs de productos aplicables (null = todos)'
      },
      excludedCategories: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true,
        comment: 'IDs de categorías excluidas'
      },
      excludedProducts: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true,
        comment: 'IDs de productos excluidos'
      },
      firstPurchaseOnly: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Solo para primera compra del usuario'
      },
      stackable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si se puede combinar con otros cupones'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID del admin que creó el cupón'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Índices para optimizar búsquedas
    await queryInterface.addIndex('Coupons', ['code'], {
      name: 'coupons_code_idx',
      unique: true
    });

    await queryInterface.addIndex('Coupons', ['isActive'], {
      name: 'coupons_is_active_idx'
    });

    await queryInterface.addIndex('Coupons', ['startDate', 'endDate'], {
      name: 'coupons_dates_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Coupons');
  }
};
