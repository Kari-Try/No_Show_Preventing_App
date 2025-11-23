//backend/routes/reviews.js
const express = require('express');
const { Review, Reservation, Venue, User } = require('../models');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// 리뷰 작성
router.post('/', verifyToken, checkRole('customer'), async (req, res) => {
  try {
    const {
      reservation_id,
      rating,
      content
    } = req.body;

    if (!reservation_id || !rating) {
      return res.status(400).json({
        success: false,
        message: '필수 정보를 모두 입력해주세요.'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: '평점은 1~5 사이의 값이어야 합니다.'
      });
    }

    // 예약 확인
    const reservation = await Reservation.findOne({
      where: { reservation_id }
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다.'
      });
    }

    if (reservation.customer_user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: '리뷰를 작성할 권한이 없습니다.'
      });
    }

    if (reservation.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: '완료된 예약만 리뷰를 작성할 수 있습니다.'
      });
    }

    // 이미 리뷰가 있는지 확인
    const existingReview = await Review.findOne({
      where: { reservation_id }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: '이미 리뷰를 작성했습니다.'
      });
    }

    const review = await Review.create({
      reservation_id,
      venue_id: reservation.venue_id,
      user_id: req.user.user_id,
      rating,
      content
    });

    res.status(201).json({
      success: true,
      message: '리뷰가 작성되었습니다.',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: '리뷰 작성 중 오류가 발생했습니다.'
    });
  }
});

// 업장 리뷰 목록 조회
router.get('/venue/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      where: { venue_id: venueId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'real_name', 'profile_image']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get venue reviews error:', error);
    res.status(500).json({
      success: false,
      message: '리뷰 조회 중 오류가 발생했습니다.'
    });
  }
});

// 리뷰 답변 작성 (업장 소유자만)
router.put('/:reviewId/reply', verifyToken, checkRole('owner'), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { owner_reply } = req.body;

    if (!owner_reply) {
      return res.status(400).json({
        success: false,
        message: '답변 내용을 입력해주세요.'
      });
    }

    const review = await Review.findOne({
      where: { review_id: reviewId },
      include: [{
        model: Venue,
        as: 'venue'
      }]
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다.'
      });
    }

    if (review.venue.owner_user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: '답변을 작성할 권한이 없습니다.'
      });
    }

    await review.update({
      owner_reply,
      owner_reply_at: new Date()
    });

    res.json({
      success: true,
      message: '답변이 작성되었습니다.',
      data: review
    });
  } catch (error) {
    console.error('Reply review error:', error);
    res.status(500).json({
      success: false,
      message: '답변 작성 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;