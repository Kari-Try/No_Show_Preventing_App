// backend/routes/reservations.js
const express = require('express');
const { Reservation, VenueService, Venue, User, UserGrade, Payment } = require('../models');
const { verifyToken, checkRole } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// 예약 가능 시간 조회
router.get('/available-slots/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: '날짜를 입력해주세요.'
      });
    }

    const service = await VenueService.findOne({
      where: { service_id: serviceId, is_active: true },
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

    // 해당 날짜의 예약 조회
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingReservations = await Reservation.findAll({
      where: {
        service_id: serviceId,
        scheduled_start: {
          [Op.between]: [startOfDay, endOfDay]
        },
        status: {
          [Op.notIn]: ['CANCELED', 'NO_SHOW']
        }
      },
      attributes: ['scheduled_start', 'scheduled_end']
    });

    // 영업 시간 설정 (예시: 09:00 ~ 21:00)
    const availableSlots = [];
    const openHour = 9;
    const closeHour = 21;
    const slotDuration = service.duration_minutes;

    for (let hour = openHour; hour < closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        // 영업 종료 시간을 넘어가면 제외
        if (slotEnd.getHours() >= closeHour) continue;

        // 이미 예약된 시간인지 확인
        const isBooked = existingReservations.some(reservation => {
          const resStart = new Date(reservation.scheduled_start);
          const resEnd = new Date(reservation.scheduled_end);
          return (slotStart >= resStart && slotStart < resEnd) ||
                 (slotEnd > resStart && slotEnd <= resEnd) ||
                 (slotStart <= resStart && slotEnd >= resEnd);
        });

        availableSlots.push({
          start: slotStart,
          end: slotEnd,
          available: !isBooked
        });
      }
    }

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: '예약 가능 시간 조회 중 오류가 발생했습니다.'
    });
  }
});

// 예약 생성
router.post('/', verifyToken, checkRole('customer'), async (req, res) => {
  const transaction = await require('../config/database').transaction();

  try {
    const {
      service_id,
      scheduled_start,
      party_size
    } = req.body;

    if (!service_id || !scheduled_start) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '필수 정보를 모두 입력해주세요.'
      });
    }

    // 서비스 조회
    const service = await VenueService.findOne({
      where: { service_id, is_active: true },
      include: [{
        model: Venue,
        as: 'venue'
      }]
    });

    if (!service) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '서비스를 찾을 수 없습니다.'
      });
    }

    // 예약 종료 시간 계산
    const scheduledStart = new Date(scheduled_start);
    const scheduledEnd = new Date(scheduledStart);
    scheduledEnd.setMinutes(scheduledEnd.getMinutes() + service.duration_minutes);

    // 중복 예약 확인
    const existingReservation = await Reservation.findOne({
      where: {
        service_id,
        scheduled_start: scheduledStart,
        status: {
          [Op.notIn]: ['CANCELED', 'NO_SHOW']
        }
      }
    });

    if (existingReservation) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '이미 예약된 시간입니다.'
      });
    }

    // 사용자 등급 조회
    const user = await User.findOne({
      where: { user_id: req.user.user_id },
      include: [{
        model: UserGrade,
        as: 'grade'
      }]
    });

    // 보증금 계산
    const totalPrice = service.price * (party_size || 1);
    const depositRate = service.deposit_rate_percent || service.venue.default_deposit_rate_percent;
    const gradeDiscount = user.grade.deposit_discount_percent || 0;
    const finalDepositRate = Math.max(0, depositRate - gradeDiscount);
    const depositAmount = (totalPrice * finalDepositRate) / 100;

    // 예약 생성
    const reservation = await Reservation.create({
      customer_user_id: req.user.user_id,
      venue_id: service.venue_id,
      service_id,
      party_size: party_size || 1,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      status: 'BOOKED',
      total_price_at_booking: totalPrice,
      applied_deposit_rate_percent: finalDepositRate,
      applied_grade_id: user.grade_id,
      applied_grade_discount_percent: gradeDiscount,
      deposit_amount: depositAmount,
      currency: 'KRW'
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: '예약이 생성되었습니다.',
      data: {
        reservation_id: reservation.reservation_id,
        deposit_amount: depositAmount,
        total_price: totalPrice
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      message: '예약 생성 중 오류가 발생했습니다.'
    });
  }
});

// 내 예약 목록 조회
router.get('/my-reservations', verifyToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = { customer_user_id: req.user.user_id };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Reservation.findAndCountAll({
      where,
      include: [{
        model: Venue,
        as: 'venue',
        attributes: ['venue_id', 'venue_name', 'address']
      }, {
        model: VenueService,
        as: 'service',
        attributes: ['service_id', 'service_name', 'price', 'duration_minutes']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['scheduled_start', 'DESC']]
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
    console.error('Get my reservations error:', error);
    res.status(500).json({
      success: false,
      message: '예약 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 예약 상세 조회
router.get('/:reservationId', verifyToken, async (req, res) => {
  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findOne({
      where: { reservation_id: reservationId },
      include: [{
        model: Venue,
        as: 'venue',
        include: [{
          model: User,
          as: 'owner',
          attributes: ['user_id', 'real_name', 'phone']
        }]
      }, {
        model: VenueService,
        as: 'service'
      }, {
        model: User,
        as: 'customer',
        attributes: ['user_id', 'real_name', 'email', 'phone']
      }, {
        model: Payment,
        as: 'payments'
      }]
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다.'
      });
    }

    // 권한 확인 (본인 또는 업장 소유자만)
    const userRoles = req.user.Roles.map(r => r.role_name);
    if (reservation.customer_user_id !== req.user.user_id &&
        reservation.venue.owner_user_id !== req.user.user_id &&
        !userRoles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: '예약 정보를 조회할 권한이 없습니다.'
      });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Get reservation detail error:', error);
    res.status(500).json({
      success: false,
      message: '예약 조회 중 오류가 발생했습니다.'
    });
  }
});

// 예약 취소
router.put('/:reservationId/cancel', verifyToken, async (req, res) => {
  const transaction = await require('../config/database').transaction();

  try {
    const { reservationId } = req.params;
    const { cancel_reason } = req.body;

    const reservation = await Reservation.findOne({
      where: { reservation_id: reservationId }
    });

    if (!reservation) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다.'
      });
    }

    if (reservation.customer_user_id !== req.user.user_id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: '예약을 취소할 권한이 없습니다.'
      });
    }

    if (reservation.status !== 'BOOKED') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '취소할 수 없는 예약입니다.'
      });
    }

    // 예약 시작 시간 확인 (24시간 전까지만 취소 가능)
    const now = new Date();
    const scheduledStart = new Date(reservation.scheduled_start);
    const hoursUntilReservation = (scheduledStart - now) / (1000 * 60 * 60);

    if (hoursUntilReservation < 24) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '예약 시작 24시간 전까지만 취소 가능합니다.'
      });
    }

    await reservation.update({
      status: 'CANCELED',
      canceled_at: new Date(),
      canceled_by_user_id: req.user.user_id,
      cancel_reason
    }, { transaction });

    // 보증금 결제가 있었다면 환불 처리 (실제 PG 연동 시 구현)
    const depositPayment = await Payment.findOne({
      where: {
        reservation_id: reservationId,
        payment_type: 'DEPOSIT',
        status: 'CAPTURED'
      }
    });

    if (depositPayment) {
      await Payment.create({
        reservation_id: reservationId,
        payer_user_id: req.user.user_id,
        payment_type: 'REFUND',
        status: 'REFUNDED',
        amount: depositPayment.amount,
        currency: depositPayment.currency,
        related_payment_id: depositPayment.payment_id,
        paid_at: new Date()
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: '예약이 취소되었습니다.'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      success: false,
      message: '예약 취소 중 오류가 발생했습니다.'
    });
  }
});

// 노쇼 처리 (업장 소유자만)
router.put('/:reservationId/no-show', verifyToken, checkRole('owner'), async (req, res) => {
  const transaction = await require('../config/database').transaction();

  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findOne({
      where: { reservation_id: reservationId },
      include: [{
        model: Venue,
        as: 'venue'
      }]
    });

    if (!reservation) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다.'
      });
    }

    if (reservation.venue.owner_user_id !== req.user.user_id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: '노쇼 처리 권한이 없습니다.'
      });
    }

    if (reservation.status !== 'BOOKED') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '노쇼 처리할 수 없는 예약입니다.'
      });
    }

    await reservation.update({
      status: 'NO_SHOW',
      no_show_marked_at: new Date()
    }, { transaction });

    // 고객의 노쇼 카운트 증가
    await User.increment('no_show_count', {
      by: 1,
      where: { user_id: reservation.customer_user_id },
      transaction
    });

    await transaction.commit();

    res.json({
      success: true,
      message: '노쇼 처리되었습니다.'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Mark no-show error:', error);
    res.status(500).json({
      success: false,
      message: '노쇼 처리 중 오류가 발생했습니다.'
    });
  }
});

// 예약 완료 처리 (업장 소유자만)
router.put('/:reservationId/complete', verifyToken, checkRole('owner'), async (req, res) => {
  const transaction = await require('../config/database').transaction();

  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findOne({
      where: { reservation_id: reservationId },
      include: [{
        model: Venue,
        as: 'venue'
      }]
    });

    if (!reservation) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다.'
      });
    }

    if (reservation.venue.owner_user_id !== req.user.user_id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: '예약 완료 처리 권한이 없습니다.'
      });
    }

    if (reservation.status !== 'BOOKED') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '완료 처리할 수 없는 예약입니다.'
      });
    }

    await reservation.update({
      status: 'COMPLETED'
    }, { transaction });

    // 고객의 성공 카운트 증가
    await User.increment('success_count', {
      by: 1,
      where: { user_id: reservation.customer_user_id },
      transaction
    });

    await transaction.commit();

    res.json({
      success: true,
      message: '예약이 완료 처리되었습니다.'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Complete reservation error:', error);
    res.status(500).json({
      success: false,
      message: '예약 완료 처리 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;