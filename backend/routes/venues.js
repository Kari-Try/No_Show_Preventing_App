// backend/routes/venues.js
const express = require('express');
const { Venue, VenueService, User } = require('../models');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// 업장 목록 조회
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = { is_active: true };
    if (search) {
      where.venue_name = { [require('sequelize').Op.like]: `%${search}%` };
    }

    const { count, rows } = await Venue.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'owner',
        attributes: ['user_id', 'real_name', 'email']
      }, {
        model: VenueService,
        as: 'services',
        where: { is_active: true },
        required: false
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
    console.error('Get venues error:', error);
    res.status(500).json({
      success: false,
      message: '업장 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 업장 상세 조회
router.get('/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;

    const venue = await Venue.findOne({
      where: { venue_id: venueId, is_active: true },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['user_id', 'real_name', 'email', 'phone']
      }, {
        model: VenueService,
        as: 'services',
        where: { is_active: true },
        required: false
      }]
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: '업장을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: venue
    });
  } catch (error) {
    console.error('Get venue detail error:', error);
    res.status(500).json({
      success: false,
      message: '업장 조회 중 오류가 발생했습니다.'
    });
  }
});

// 업장 등록 (사장만)
router.post('/', verifyToken, checkRole('owner'), async (req, res) => {
  try {
    const {
      venue_name,
      description,
      base_price,
      default_deposit_rate_percent,
      address,
      address_detail,
      latitude,
      longitude
    } = req.body;

    if (!venue_name) {
      return res.status(400).json({
        success: false,
        message: '업장명은 필수입니다.'
      });
    }

    // 동일 사장의 같은 이름 업장 체크
    const existingVenue = await Venue.findOne({
      where: {
        owner_user_id: req.user.user_id,
        venue_name
      }
    });

    if (existingVenue) {
      return res.status(400).json({
        success: false,
        message: '이미 같은 이름의 업장이 존재합니다.'
      });
    }

    const venue = await Venue.create({
      owner_user_id: req.user.user_id,
      venue_name,
      description,
      base_price,
      default_deposit_rate_percent: default_deposit_rate_percent || 30,
      address,
      address_detail,
      latitude,
      longitude
    });

    res.status(201).json({
      success: true,
      message: '업장이 등록되었습니다.',
      data: venue
    });
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({
      success: false,
      message: '업장 등록 중 오류가 발생했습니다.'
    });
  }
});

// 업장 수정 (소유자만)
router.put('/:venueId', verifyToken, checkRole('owner'), async (req, res) => {
  try {
    const { venueId } = req.params;
    const venue = await Venue.findOne({
      where: { venue_id: venueId }
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: '업장을 찾을 수 없습니다.'
      });
    }

    if (venue.owner_user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: '업장을 수정할 권한이 없습니다.'
      });
    }

    await venue.update(req.body);

    res.json({
      success: true,
      message: '업장 정보가 수정되었습니다.',
      data: venue
    });
  } catch (error) {
    console.error('Update venue error:', error);
    res.status(500).json({
      success: false,
      message: '업장 수정 중 오류가 발생했습니다.'
    });
  }
});

// 업장 삭제 (소유자만)
router.delete('/:venueId', verifyToken, checkRole('owner'), async (req, res) => {
  try {
    const { venueId } = req.params;
    const venue = await Venue.findOne({
      where: { venue_id: venueId }
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: '업장을 찾을 수 없습니다.'
      });
    }

    if (venue.owner_user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: '업장을 삭제할 권한이 없습니다.'
      });
    }

    await venue.update({
      is_active: false,
      deleted_at: new Date()
    });

    res.json({
      success: true,
      message: '업장이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Delete venue error:', error);
    res.status(500).json({
      success: false,
      message: '업장 삭제 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;