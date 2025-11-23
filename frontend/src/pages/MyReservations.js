// frontend/src/pages/MyReservations.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const MyReservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [page, filter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await api.get('/api/reservations/my-reservations', { params });
      
      if (response.data.success) {
        setReservations(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Fetch reservations error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!cancelReason.trim()) {
      alert('취소 사유를 입력해주세요.');
      return;
    }

    try {
      const response = await api.put(
        `/api/reservations/${selectedReservation.reservation_id}/cancel`,
        { cancel_reason: cancelReason }
      );

      if (response.data.success) {
        alert('예약이 취소되었습니다.');
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedReservation(null);
        fetchReservations();
      }
    } catch (error) {
      console.error('Cancel reservation error:', error);
      alert(error.response?.data?.message || '예약 취소에 실패했습니다.');
    }
  };

  const handlePayDeposit = async (reservationId, depositAmount) => {
    try {
      const response = await api.post('/api/payments/deposit', {
        reservation_id: reservationId,
        payment_method: 'card'
      });

      if (response.data.success) {
        alert('보증금 결제가 완료되었습니다.');
        fetchReservations();
      }
    } catch (error) {
      console.error('Pay deposit error:', error);
      alert(error.response?.data?.message || '결제에 실패했습니다.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      BOOKED: { text: '예약됨', color: 'bg-blue-100 text-blue-800' },
      COMPLETED: { text: '완료', color: 'bg-green-100 text-green-800' },
      CANCELED: { text: '취소됨', color: 'bg-gray-100 text-gray-800' },
      NO_SHOW: { text: '노쇼', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const canCancel = (reservation) => {
    if (reservation.status !== 'BOOKED') return false;
    
    const now = new Date();
    const scheduledStart = new Date(reservation.scheduled_start);
    const hoursUntil = (scheduledStart - now) / (1000 * 60 * 60);
    
    return hoursUntil >= 24;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">내 예약</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => { setFilter('all'); setPage(1); }}
              className={`px-4 py-2 rounded-md ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => { setFilter('BOOKED'); setPage(1); }}
              className={`px-4 py-2 rounded-md ${
                filter === 'BOOKED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              예약됨
            </button>
            <button
              onClick={() => { setFilter('COMPLETED'); setPage(1); }}
              className={`px-4 py-2 rounded-md ${
                filter === 'COMPLETED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              완료
            </button>
            <button
              onClick={() => { setFilter('CANCELED'); setPage(1); }}
              className={`px-4 py-2 rounded-md ${
                filter === 'CANCELED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              취소됨
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">예약 내역이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.reservation_id}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {reservation.venue?.venue_name}
                      </h3>
                      <p className="text-gray-600">
                        {reservation.service?.service_name}
                      </p>
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">예약 일시:</span>
                      <span className="ml-2 font-medium">
                        {new Date(reservation.scheduled_start).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">인원:</span>
                      <span className="ml-2 font-medium">{reservation.party_size}명</span>
                    </div>
                    <div>
                      <span className="text-gray-500">총 금액:</span>
                      <span className="ml-2 font-medium">
                        {reservation.total_price_at_booking?.toLocaleString()}원
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">보증금:</span>
                      <span className="ml-2 font-medium">
                        {reservation.deposit_amount?.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  {reservation.status === 'BOOKED' && (
                    <div className="flex space-x-2">
                      {!reservation.payments?.some(p => p.payment_type === 'DEPOSIT' && p.status === 'CAPTURED') && (
                        <button
                          onClick={() => handlePayDeposit(reservation.reservation_id, reservation.deposit_amount)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          보증금 결제
                        </button>
                      )}
                      {canCancel(reservation) && (
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowCancelModal(true);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          예약 취소
                        </button>
                      )}
                    </div>
                  )}

                  {reservation.status === 'CANCELED' && reservation.cancel_reason && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">취소 사유:</span> {reservation.cancel_reason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                <span className="px-4 py-2">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 취소 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">예약 취소</h3>
            <p className="text-gray-600 mb-4">
              예약을 취소하시겠습니까? 취소 사유를 입력해주세요.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="취소 사유를 입력하세요"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedReservation(null);
                }}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                닫기
              </button>
              <button
                onClick={handleCancelReservation}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                취소하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReservations;