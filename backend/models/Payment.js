// backend/models/Payment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reservation_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  payer_user_id: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  payment_type: {
    type: DataTypes.ENUM('DEPOSIT', 'BALANCE', 'REFUND'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('AUTHORIZED', 'CAPTURED', 'CANCELED', 'REFUNDED', 'FAILED'),
    defaultValue: 'AUTHORIZED'
  },
  method: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  provider: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  provider_txn_id: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'KRW'
  },
  related_payment_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['reservation_id', 'payment_type', 'status']
    }
  ]
});

module.exports = Payment;