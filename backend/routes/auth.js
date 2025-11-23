// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { User, Role, UserRole, UserGrade } = require('../models');
const { generateToken } = require('../utils/jwt');
const { validateEmail, validatePhone, validatePassword } = require('../utils/validation');

const router = express.Router();

// 회원가입
router.post('/signup', async (req, res) => {
  const transaction = await require('../config/database').transaction();
  
  try {
    const { email, password, name, phone, userType } = req.body;

    // 입력 검증
    if (!email || !password || !name || !phone || !userType) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '필수 정보를 모두 입력해주세요.'
      });
    }

    if (!validateEmail(email)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 이메일 형식입니다.'
      });
    }

    if (!validatePhone(phone)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)'
      });
    }

    if (!validatePassword(password)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '비밀번호는 8자 이상이어야 합니다.'
      });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 이메일입니다.'
      });
    }

    // 전화번호 중복 확인
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 전화번호입니다.'
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 기본 등급 조회
    const defaultGrade = await UserGrade.findOne({ where: { is_default: true } });

    // 사용자 생성
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const user = await User.create({
      user_id: userId,
      email,
      password_hash: hashedPassword,
      real_name: name,
      phone,
      username: email.split('@')[0],
      login_type: 'local',
      grade_id: defaultGrade ? defaultGrade.grade_id : 1
    }, { transaction });

    // 역할 할당
    const role = await Role.findOne({ where: { role_name: userType } });
    if (!role) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 유형입니다.'
      });
    }

    await UserRole.create({
      user_id: userId,
      role_id: role.role_id
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: '회원가입 중 오류가 발생했습니다.'
    });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.'
      });
    }

    // 사용자 조회
    const user = await User.findOne({
      where: { email, is_active: true },
      include: [{
        model: Role,
        through: { attributes: [] }
      }, {
        model: UserGrade,
        as: 'grade'
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.'
      });
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.'
      });
    }

    // JWT 토큰 생성
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: '로그인 성공',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.real_name,
        phone: user.phone,
        grade: user.grade,
        roles: user.Roles.map(r => r.role_name),
        login_type: user.login_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다.'
    });
  }
});

// 네이버 로그인 URL 생성
router.get('/naver', (req, res) => {
  try {
    const state = Math.random().toString(36).substring(2, 15);
    const clientId = process.env.NAVER_CLIENT_ID;
    const redirectURI = encodeURIComponent(process.env.NAVER_CALLBACK_URL);

    req.session.naverState = state;

    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectURI}&state=${state}`;

    res.json({
      success: true,
      url: naverAuthUrl
    });
  } catch (error) {
    console.error('Naver auth error:', error);
    res.status(500).json({
      success: false,
      message: '네이버 로그인 연결에 실패했습니다.'
    });
  }
});

// 네이버 로그인 콜백
router.get('/naver/callback', async (req, res) => {
  const { code, state } = req.query;
  const transaction = await require('../config/database').transaction();

  try {
    // state 검증
    if (state !== req.session.naverState) {
      await transaction.rollback();
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
    }

    // 액세스 토큰 발급
    const tokenResponse = await axios.get('https://nid.naver.com/oauth2.0/token', {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.NAVER_CLIENT_ID,
        client_secret: process.env.NAVER_CLIENT_SECRET,
        code: code,
        state: state
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // 사용자 정보 조회
    const userResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const naverUser = userResponse.data.response;

    // 기존 사용자 조회 (네이버 ID 또는 이메일로)
    let user = await User.findOne({
      where: { naver_id: naverUser.id },
      include: [{
        model: Role,
        through: { attributes: [] }
      }, {
        model: UserGrade,
        as: 'grade'
      }]
    });

    // 신규 사용자 생성
    if (!user) {
      const defaultGrade = await UserGrade.findOne({ where: { is_default: true } });
      const userId = `naver_${naverUser.id}`;

      user = await User.create({
        user_id: userId,
        email: naverUser.email,
        real_name: naverUser.name,
        phone: naverUser.mobile?.replace(/-/g, '').replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3'),
        username: naverUser.nickname || naverUser.email.split('@')[0],
        login_type: 'naver',
        naver_id: naverUser.id,
        profile_image: naverUser.profile_image,
        grade_id: defaultGrade ? defaultGrade.grade_id : 1
      }, { transaction });

      // 기본 역할 할당 (customer)
      const customerRole = await Role.findOne({ where: { role_name: 'customer' } });
      await UserRole.create({
        user_id: userId,
        role_id: customerRole.role_id
      }, { transaction });

      // 관계 재조회
      user = await User.findOne({
        where: { user_id: userId },
        include: [{
          model: Role,
          through: { attributes: [] }
        }, {
          model: UserGrade,
          as: 'grade'
        }]
      });
    }

    await transaction.commit();

    // JWT 토큰 생성
    const token = generateToken(user);

    const userInfo = {
      user_id: user.user_id,
      email: user.email,
      name: user.real_name,
      phone: user.phone,
      profileImage: user.profile_image,
      grade: user.grade,
      roles: user.Roles.map(r => r.role_name),
      login_type: user.login_type
    };

    // 프론트엔드로 리다이렉트
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userInfo))}`);
  } catch (error) {
    await transaction.rollback();
    console.error('Naver callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=naver_login_failed`);
  }
});

// 로그아웃
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '로그아웃 실패'
      });
    }
    res.status(200).json({
      success: true,
      message: '로그아웃 되었습니다.'
    });
  });
});

// 토큰 검증
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }

    const decoded = require('../utils/jwt').verifyToken(token);
    
    const user = await User.findOne({
      where: { user_id: decoded.user_id, is_active: true },
      include: [{
        model: Role,
        through: { attributes: [] }
      }, {
        model: UserGrade,
        as: 'grade'
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 사용자입니다.'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.real_name,
        phone: user.phone,
        grade: user.grade,
        roles: user.Roles.map(r => r.role_name),
        login_type: user.login_type
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }
});

module.exports = router;