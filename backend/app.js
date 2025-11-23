// backend/app.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/auth');
const venueRoutes = require('./routes/venues');
const serviceRoutes = require('./routes/services');
const reservationRoutes = require('./routes/reservations');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');

const app = express();

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트
app.use('/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// 테스트 라우트
app.get('/', (req, res) => {
  res.json({ message: 'No-Show Prevention Platform API Server' });
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '서버 오류가 발생했습니다.'
  });
});

// DB 연결 및 서버 시작
const { sequelize } = require('./models');
const PORT = process.env.PORT || 8000;

sequelize.sync({ force: false }).then(() => {
  console.log('Database connected successfully');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

module.exports = app;