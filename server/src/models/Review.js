const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  isVerifiedPurchase: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  helpfulCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  notHelpfulCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  adminResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminRespondedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Reviews',
  timestamps: true
});

module.exports = Review;
