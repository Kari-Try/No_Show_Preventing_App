// backend/models/Reservation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  reservation_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customer_user_id: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  venue_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  party_size: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  scheduled_start: {
    type: DataTypes.DATE,
    allowNull: false
  },
  scheduled_end: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('BOOKED', 'COMPLETED', 'CANCELED', 'NO_SHOW'),
    defaultValue: 'BOOKED'
  },
  canceled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  canceled_by_user_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  cancel_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  no_show_marked_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  total_price_at_booking: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  applied_deposit_rate_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  applied_grade_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  applied_grade_discount_percent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  deposit_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'KRW'
  }
}, {
  tableName: 'reservations',
  timestamps: true,
  underscored: true,
  createdAt: 'booked_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['service_id', 'scheduled_start']
    },
    {
      fields: ['customer_user_id', 'booked_at']
    },
    {
      fields: ['venue_id', 'scheduled_start']
    }
  ]
});

module.exports = Reservation;