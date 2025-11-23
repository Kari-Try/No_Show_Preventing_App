const jwt = require('jsonwebtoken');
const { User, Role, UserRole } = require('../models');

// JWT 토큰 검증 미들웨어
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({
      where: { user_id: decoded.user_id, is_active: true },
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 사용자입니다.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }
};

// 역할 확인 미들웨어
exports.checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userRoles = req.user.Roles.map(role => role.role_name);
      
      const hasRole = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: '접근 권한이 없습니다.'
        });
      }
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: '권한 확인 중 오류가 발생했습니다.'
      });
    }
  };
};