// backend/models/Review.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  review_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reservation_id: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false
  },
  venue_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  owner_reply: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  owner_reply_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Review;