// backend/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  real_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  grade_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  no_show_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  success_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  login_type: {
    type: DataTypes.ENUM('local', 'naver'),
    defaultValue: 'local'
  },
  naver_id: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true
  },
  profile_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;