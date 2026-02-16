'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CouponUsages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      couponId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Coupons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Orden donde se usó el cupón'
      },
      discountApplied: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto del descuento aplicado'
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Fecha y hora de uso'
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

    // Índices para optimizar consultas
    await queryInterface.addIndex('CouponUsages', ['couponId'], {
      name: 'coupon_usages_coupon_id_idx'
    });

    await queryInterface.addIndex('CouponUsages', ['userId'], {
      name: 'coupon_usages_user_id_idx'
    });

    await queryInterface.addIndex('CouponUsages', ['orderId'], {
      name: 'coupon_usages_order_id_idx'
    });

    await queryInterface.addIndex('CouponUsages', ['couponId', 'userId'], {
      name: 'coupon_usages_coupon_user_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CouponUsages');
  }
};
