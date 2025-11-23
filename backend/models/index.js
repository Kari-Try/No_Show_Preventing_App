// backend/models/index.js
const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const UserRole = require('./UserRole');
const UserGrade = require('./UserGrade');
const Venue = require('./Venue');
const VenueService = require('./VenueService');
const Reservation = require('./Reservation');
const Payment = require('./Payment');
const Review = require('./Review');

// User - Role 관계 (N:M)
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id' });

// User - UserGrade 관계 (N:1)
User.belongsTo(UserGrade, { foreignKey: 'grade_id', as: 'grade' });
UserGrade.hasMany(User, { foreignKey: 'grade_id' });

// Venue - User 관계 (N:1)
Venue.belongsTo(User, { foreignKey: 'owner_user_id', as: 'owner' });
User.hasMany(Venue, { foreignKey: 'owner_user_id', as: 'venues' });

// VenueService - Venue 관계 (N:1)
VenueService.belongsTo(Venue, { foreignKey: 'venue_id', as: 'venue' });
Venue.hasMany(VenueService, { foreignKey: 'venue_id', as: 'services' });

// Reservation - User 관계 (N:1)
Reservation.belongsTo(User, { foreignKey: 'customer_user_id', as: 'customer' });
User.hasMany(Reservation, { foreignKey: 'customer_user_id', as: 'reservations' });

// Reservation - Venue 관계 (N:1)
Reservation.belongsTo(Venue, { foreignKey: 'venue_id', as: 'venue' });
Venue.hasMany(Reservation, { foreignKey: 'venue_id', as: 'reservations' });

// Reservation - VenueService 관계 (N:1)
Reservation.belongsTo(VenueService, { foreignKey: 'service_id', as: 'service' });
VenueService.hasMany(Reservation, { foreignKey: 'service_id', as: 'reservations' });

// Payment - Reservation 관계 (N:1)
Payment.belongsTo(Reservation, { foreignKey: 'reservation_id', as: 'reservation' });
Reservation.hasMany(Payment, { foreignKey: 'reservation_id', as: 'payments' });

// Payment - User 관계 (N:1)
Payment.belongsTo(User, { foreignKey: 'payer_user_id', as: 'payer' });
User.hasMany(Payment, { foreignKey: 'payer_user_id', as: 'payments' });

// Review - Reservation 관계 (1:1)
Review.belongsTo(Reservation, { foreignKey: 'reservation_id', as: 'reservation' });
Reservation.hasOne(Review, { foreignKey: 'reservation_id', as: 'review' });

// Review - Venue 관계 (N:1)
Review.belongsTo(Venue, { foreignKey: 'venue_id', as: 'venue' });
Venue.hasMany(Review, { foreignKey: 'venue_id', as: 'reviews' });

// Review - User 관계 (N:1)
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  UserGrade,
  Venue,
  VenueService,
  Reservation,
  Payment,
  Review
};