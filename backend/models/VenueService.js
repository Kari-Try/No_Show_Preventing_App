// backend/models/VenueService.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VenueService = sequelize.define('VenueService', {
  service_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  venue_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  service_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  deposit_rate_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'venue_services',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = VenueService;