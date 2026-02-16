const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReviewHelpful = sequelize.define('ReviewHelpful', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reviewId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  isHelpful: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  tableName: 'ReviewHelpful',
  timestamps: true
});

module.exports = ReviewHelpful;
