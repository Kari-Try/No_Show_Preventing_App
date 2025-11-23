// backend/models/Venue.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venue = sequelize.define('Venue', {
  venue_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  owner_user_id: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  venue_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  base_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  default_deposit_rate_percent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 30,
    validate: {
      min: 0,
      max: 100
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'KRW'
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'Asia/Seoul'
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  address_detail: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'venues',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['owner_user_id', 'venue_name']
    }
  ]
});

module.exports = Venue;