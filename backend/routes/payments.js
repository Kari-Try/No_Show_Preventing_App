// backend/routes/payments.js
const express = require('express');
const { Payment, Reservation, User } = require('../models');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// 보증금 결제
router.post('/deposit', verifyToken, async (req, res) => {
  const transaction = await require('../config/database').transaction();

  try {
    const {
      reservation_id,
      payment_method,
      provider_txn_id
    } = req.body;

    if (!reservation_id) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '예약 정보가 필요합니다.'
      });
    }

    const reservation = await Reservation.findOne({
      where: { reservation_id }
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
        message: '결제 권한이 없습니다.'
      });
    }

    // 이미 보증금 결제가 완료되었는지 확인
    const existingPayment = await Payment.findOne({
      where: {
        reservation_id,
        payment_type: 'DEPOSIT',
        status: 'CAPTURED'
      }
    });

    if (existingPayment) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '이미 보증금이 결제되었습니다.'
      });
    }

    // 실제 PG 연동은 여기서 구현
    // 임시로 결제 성공으로 처리

    const payment = await Payment.create({
      reservation_id,
      payer_user_id: req.user.user_id,
      payment_type: 'DEPOSIT',
      status: 'CAPTURED',
      method: payment_method,
      provider: 'test_pg',
      provider_txn_id: provider_txn_id || `TXN_${Date.now()}`,
      amount: reservation.deposit_amount,
      currency: reservation.currency,
      paid_at: new Date()
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: '보증금 결제가 완료되었습니다.',
      data: payment
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Deposit payment error:', error);
    res.status(500).json({
      success: false,
      message: '결제 처리 중 오류가 발생했습니다.'
    });
  }
});

// 잔금 결제
router.post('/balance', verifyToken, async (req, res) => {
  const transaction = await require('../config/database').transaction();

  try {
    const {
      reservation_id,
      payment_method,
      provider_txn_id
    } = req.body;

    const reservation = await Reservation.findOne({
      where: { reservation_id }
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
        message: '결제 권한이 없습니다.'
      });
    }

    if (reservation.status !== 'BOOKED') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '잔금을 결제할 수 없는 상태입니다.'
      });
    }

    // 보증금 결제 확인
    const depositPayment = await Payment.findOne({
      where: {
        reservation_id,
        payment_type: 'DEPOSIT',
        status: 'CAPTURED'
      }
    });

    if (!depositPayment) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '보증금이 결제되지 않았습니다.'
      });
    }

    // 잔금 계산
    const balanceAmount = reservation.total_price_at_booking - reservation.deposit_amount;

    const payment = await Payment.create({
      reservation_id,
      payer_user_id: req.user.user_id,
      payment_type: 'BALANCE',
      status: 'CAPTURED',
      method: payment_method,
      provider: 'test_pg',
      provider_txn_id: provider_txn_id || `TXN_${Date.now()}`,
      amount: balanceAmount,
      currency: reservation.currency,
      related_payment_id: depositPayment.payment_id,
      paid_at: new Date()
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: '잔금 결제가 완료되었습니다.',
      data: payment
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Balance payment error:', error);
    res.status(500).json({
      success: false,
      message: '결제 처리 중 오류가 발생했습니다.'
    });
  }
});

// 결제 내역 조회
router.get('/my-payments', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Payment.findAndCountAll({
      where: { payer_user_id: req.user.user_id },
      include: [{
        model: Reservation,
        as: 'reservation',
        attributes: ['reservation_id', 'scheduled_start', 'status']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['paid_at', 'DESC']]
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
    console.error('Get my payments error:', error);
    res.status(500).json({
      success: false,
      message: '결제 내역 조회 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;