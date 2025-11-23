// backend/routes/services.js
const express = require('express');
const { VenueService, Venue } = require('../models');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// 서비스 목록 조회
router.get('/venue/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;

    const services = await VenueService.findAll({
      where: {
        venue_id: venueId,
        is_active: true
      },
      include: [{
        model: Venue,
        as: 'venue',
        attributes: ['venue_id', 'venue_name', 'default_deposit_rate_percent']
      }]
    });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: '서비스 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 서비스 등록 (업장 소유자만)
router.post('/', verifyToken, checkRole('owner'), async (req, res) => {
  try {
    const {
      venue_id,
      service_name,
      price,
      duration_minutes,
      capacity,
      deposit_rate_percent
    } = req.body;

    if (!venue_id || !service_name || !price || !duration_minutes) {
      return res.status(400).json({
        success: false,
        message: '필수 정보를 모두 입력해주세요.'
      });
    }

    // 업장 소유권 확인
    const venue = await Venue.findOne({
      where: { venue_id }
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
        message: '서비스를 등록할 권한이 없습니다.'
      });
    }

    const service = await VenueService.create({
      venue_id,
      service_name,
      price,
      duration_minutes,
      capacity: capacity || 1,
      deposit_rate_percent
    });

    res.status(201).json({
      success: true,
      message: '서비스가 등록되었습니다.',
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: '서비스 등록 중 오류가 발생했습니다.'
    });
  }
});

// 서비스 수정
router.put('/:serviceId', verifyToken, checkRole('owner'), async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await VenueService.findOne({
      where: { service_id: serviceId },
      include: [{
        model: Venue,
        as: 'venue'
      }]
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '서비스를 찾을 수 없습니다.'
      });
    }

    if (service.venue.owner_user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: '서비스를 수정할 권한이 없습니다.'
      });
    }

    await service.update(req.body);

    res.json({
      success: true,
      message: '서비스 정보가 수정되었습니다.',
      data: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: '서비스 수정 중 오류가 발생했습니다.'
    });
  }
});

// 서비스 삭제
router.delete('/:serviceId', verifyToken, checkRole('owner'), async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await VenueService.findOne({
      where: { service_id: serviceId },
      include: [{
        model: Venue,
        as: 'venue'
      }]
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '서비스를 찾을 수 없습니다.'
      });
    }

    if (service.venue.owner_user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: '서비스를 삭제할 권한이 없습니다.'
      });
    }

    await service.update({ is_active: false });

    res.json({
      success: true,
      message: '서비스가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: '서비스 삭제 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;