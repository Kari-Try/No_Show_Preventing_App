// backend/models/Role.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_name: {
    type: DataTypes.ENUM('customer', 'owner', 'admin'),
    unique: true,
    allowNull: false
  }
}, {
  tableName: 'roles',
  timestamps: false
});

module.exports = Role;