// backend/utils/jwt.js
const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
  const payload = {
    user_id: user.user_id,
    email: user.email,
    login_type: user.login_type
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};