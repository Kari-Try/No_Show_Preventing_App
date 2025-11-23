// backend/models/UserGrade.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserGrade = sequelize.define('UserGrade', {
  grade_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  grade_name: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  grade_code: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  deposit_discount_percent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  max_no_show_rate: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 1
    }
  },
  require_no_show_zero: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'user_grades',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserGrade;