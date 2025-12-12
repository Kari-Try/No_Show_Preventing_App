// frontend/src/pages/OwnerReservations.js
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const OwnerReservations = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      fetchReservations(selectedVenue, page);
    }
  }, [selectedVenue, page]);

  const loadVenues = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.get('/api/venues', { params: { page: 1, limit: 200 } });
      if (res.data.success) {
        const mine = res.data.data.filter(v => v.owner_user_id === user.user_id);
        setVenues(mine);
        if (mine.length > 0) setSelectedVenue(mine[0].venue_id);
      }
    } catch (err) {
      console.error(err);
      setError('업장 목록을 불러오지 못했습니다.');
    }
  };

  const fetchReservations = async (venueId, pageNum) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/owner/reservations/${venueId}`, {
        params: { page: pageNum, limit: 20 }
      });
      if (res.data.success) {
        setReservations(res.data.data || []);
        setPagination(res.data.pagination || {});
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '예약 목록을 불러오지 못했습니다.');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DEPOSIT_PENDING: { text: '보증금 대기', color: 'bg-yellow-100 text-yellow-800' },
      BOOKED: { text: '예약됨', color: 'bg-blue-100 text-blue-800' },
      COMPLETED: { text: '완료', color: 'bg-green-100 text-green-800' },
      CANCELED: { text: '취소', color: 'bg-gray-100 text-gray-800' },
      NO_SHOW: { text: '노쇼', color: 'bg-red-100 text-red-800' },
      DEPOSIT_FAILED: { text: '보증금 실패', color: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const updateStatus = async (reservationId, action) => {
    try {
      const reason = action === 'CANCEL' ? prompt('취소 사유를 입력하세요 (선택)', '') : '';
      const res = await api.post(`/api/owner/reservations/${reservationId}/status`, {
        action,
        reason
      });
      if (res.data.success) {
        fetchReservations(selectedVenue, page);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || '처리에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">예약 관리</h1>
          <select
            value={selectedVenue}
            onChange={(e) => { setSelectedVenue(e.target.value); setPage(1); }}
            className="border px-3 py-2 rounded"
          >
            {venues.map(v => (
              <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>
            ))}
          </select>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">예약 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map(r => (
              <div key={r.reservation_id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{r.customer?.real_name || r.customer_user_id}</h3>
                    <p className="text-sm text-gray-600">{r.service?.service_name}</p>
                  </div>
                  {getStatusBadge(r.status)}
                </div>
                <p className="text-sm text-gray-700 mb-2">예약 일시: {new Date(r.scheduled_start).toLocaleString('ko-KR')}</p>
                <p className="text-sm text-gray-700 mb-2">인원: {r.party_size}명</p>
                <p className="text-sm text-gray-700 mb-2">보증금: {r.deposit_amount?.toLocaleString()}원</p>
                <div className="flex space-x-2">
                  {r.status !== 'NO_SHOW' && (
                    <button
                      onClick={() => updateStatus(r.reservation_id, 'NO_SHOW')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      노쇼 처리
                    </button>
                  )}
                  {r.status !== 'CANCELED' && (
                    <button
                      onClick={() => updateStatus(r.reservation_id, 'CANCEL')}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                    >
                      강제 취소
                    </button>
                  )}
                  {r.status !== 'COMPLETED' && (
                    <button
                      onClick={() => updateStatus(r.reservation_id, 'COMPLETE')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      완료 처리
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
};

export default OwnerReservations;
