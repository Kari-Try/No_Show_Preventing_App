// frontend/src/pages/VenueDetail.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const dayLabel = ['일', '월', '화', '수', '목', '금', '토'];

const VenueDetail = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [businessHours, setBusinessHours] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState(1);

  useEffect(() => {
    fetchVenueDetail();
    fetchServices();
    fetchReviews();
    fetchBusinessHours();
    fetchBlocks();
  }, [venueId]);

  const fetchVenueDetail = async () => {
    try {
      const res = await api.get(`/api/venues/${venueId}`);
      if (res.data.success) setVenue(res.data.data);
    } catch (err) {
      console.error('Fetch venue detail error:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get(`/api/services/venue/${venueId}`);
      if (res.data.success) setServices(res.data.data || []);
    } catch (err) {
      console.error('Fetch services error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/api/reviews/venue/${venueId}`);
      if (res.data.success) {
        const list = res.data.data || [];
        setReviews(list);
        if (list.length > 0) {
          const sum = list.reduce((acc, r) => acc + (r.rating || 0), 0);
          setAverageRating((sum / list.length).toFixed(1));
        } else {
          setAverageRating(null);
        }
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
    }
  };

  const fetchBusinessHours = async () => {
    try {
      const res = await api.get(`/api/services/venue/${venueId}/business-hours`);
      if (res.data.success) setBusinessHours(res.data.data || []);
    } catch (err) {
      console.error('Fetch business hours error:', err);
    }
  };

  const fetchBlocks = async () => {
    try {
      const res = await api.get(`/api/services/venue/${venueId}/blocks`);
      if (res.data.success) setBlocks(res.data.data || []);
    } catch (err) {
      console.error('Fetch blocks error:', err);
    }
  };

  const handleReservation = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const scheduledStart = `${selectedDate}T${selectedTime}`;
      const res = await api.post('/api/reservations', {
        service_id: selectedService,
        scheduled_start: scheduledStart,
        party_size: partySize,
      });
      if (res.data.success) {
        alert('예약이 생성되었습니다. 보증금을 결제해주세요.');
        navigate('/my-reservations');
      }
    } catch (err) {
      console.error('Create reservation error:', err);
      alert(err.response?.data?.message || '예약 생성에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <p className="text-gray-500">해당 업장을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.venue_name}</h1>
              <p className="text-gray-600 mb-2">{venue.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">주소:</span>
                  <span className="ml-2">{venue.address || '정보 없음'}</span>
                </div>
                <div>
                  <span className="text-gray-500">보증금 비율:</span>
                  <span className="ml-2">{venue.default_deposit_rate_percent}%</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-yellow-500">
                {averageRating ? `★ ${averageRating}` : '리뷰 없음'}
              </div>
              {averageRating && (
                <div className="text-xs text-gray-500">리뷰 {reviews.length}개 기준</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">예약하기</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">서비스 선택</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">서비스를 선택하세요</option>
                  {services.map((service) => (
                    <option key={service.service_id} value={service.service_id}>
                      {service.service_name} - {service.price.toLocaleString()}원 ({service.duration_minutes}분)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시간</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  step="1800"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">인원</label>
                <input
                  type="number"
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value || '1', 10))}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleReservation}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
              >
                예약하기
              </button>
            </div>

            {businessHours.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">영업시간</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {businessHours.map((bh) => (
                    <li key={bh.business_hour_id}>
                      {dayLabel[bh.day_of_week]} {bh.open_time} ~ {bh.close_time}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {blocks.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">예약 불가</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {blocks.map((b) => (
                    <li key={b.block_id}>
                      {b.block_date} {b.start_time} ~ {b.end_time} {b.reason ? `(${b.reason})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">리뷰</h2>
              {averageRating && (
                <span className="text-yellow-500 font-semibold">★ {averageRating}</span>
              )}
            </div>
            {reviews.length === 0 ? (
              <p className="text-gray-500">아직 리뷰가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.review_id} className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <span className="font-medium">{review.user?.real_name}</span>
                      <span className="ml-2 text-yellow-500">{'★'.repeat(review.rating)}</span>
                    </div>
                    {review.has_image && (
                      <div className="mb-2">
                        <img
                          src={`/api/reviews/${review.review_id}/image`}
                          alt="리뷰 이미지"
                          className="max-h-48 rounded"
                        />
                      </div>
                    )}
                    <p className="text-gray-600 whitespace-pre-wrap">{review.content}</p>
                    {review.owner_reply && (
                      <div className="mt-2 ml-4 p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">점주 답변:</span> {review.owner_reply}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;
