import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

const ManageVenue = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [services, setServices] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [faqs, setFaqs] = useState([]);

  const [serviceForm, setServiceForm] = useState({
    service_name: '',
    description: '',
    price: '',
    duration_minutes: 60,
    min_party_size: 1,
    max_party_size: 1,
    deposit_rate_percent: ''
  });

  const [hourForm, setHourForm] = useState({
    day_of_week: 1,
    open_time: '09:00',
    close_time: '18:00'
  });

  const [blockForm, setBlockForm] = useState({
    block_date: '',
    start_time: '',
    end_time: '',
    reason: ''
  });

  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    is_active: true
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVenue();
    fetchServices();
    fetchBusinessHours();
    fetchBlocks();
    fetchFaqs();
  }, [venueId]);

  const fetchVenue = async () => {
    try {
      const res = await api.get(`/api/venues/${venueId}`);
      if (res.data.success) setVenue(res.data.data);
    } catch (err) {
      console.error(err);
      setError('업장 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get(`/api/services/venue/${venueId}`);
      if (res.data.success) setServices(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBusinessHours = async () => {
    try {
      const res = await api.get(`/api/services/venue/${venueId}/business-hours`);
      if (res.data.success) setBusinessHours(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBlocks = async () => {
    try {
      const res = await api.get(`/api/services/venue/${venueId}/blocks`);
      if (res.data.success) setBlocks(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFaqs = async () => {
    try {
      const res = await api.get(`/api/owner/faq/${venueId}`);
      if (res.data.success) setFaqs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        venue_id: Number(venueId),
        service_name: serviceForm.service_name,
        description: serviceForm.description,
        price: Number(serviceForm.price),
        duration_minutes: Number(serviceForm.duration_minutes),
        min_party_size: Number(serviceForm.min_party_size),
        max_party_size: Number(serviceForm.max_party_size),
        deposit_rate_percent: serviceForm.deposit_rate_percent !== '' ? Number(serviceForm.deposit_rate_percent) : null
      };
      const res = await api.post('/api/owner/services', payload);
      if (res.data.success) {
        setSuccess('서비스를 등록했습니다.');
        setServiceForm({
          service_name: '',
          description: '',
          price: '',
          duration_minutes: 60,
          min_party_size: 1,
          max_party_size: 1,
          deposit_rate_percent: ''
        });
        fetchServices();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '서비스 등록에 실패했습니다.');
    }
  };

  const handleBusinessHourSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post(`/api/owner/venues/${venueId}/business-hours`, {
        day_of_week: Number(hourForm.day_of_week),
        open_time: hourForm.open_time,
        close_time: hourForm.close_time
      });
      setSuccess('영업시간을 추가했습니다.');
      fetchBusinessHours();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '영업시간 추가에 실패했습니다.');
    }
  };

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post(`/api/owner/venues/${venueId}/blocks`, {
        block_date: blockForm.block_date,
        start_time: blockForm.start_time,
        end_time: blockForm.end_time,
        reason: blockForm.reason
      });
      setSuccess('예약 불가 시간을 추가했습니다.');
      fetchBlocks();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '예약 불가 시간 추가에 실패했습니다.');
    }
  };

  const handleDeleteBusinessHour = async (id) => {
    try {
      await api.delete(`/api/owner/business-hours/${id}`);
      setSuccess('영업시간을 삭제했습니다.');
      fetchBusinessHours();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '영업시간 삭제에 실패했습니다.');
    }
  };

  const handleDeleteBlock = async (id) => {
    try {
      await api.delete(`/api/owner/blocks/${id}`);
      setSuccess('예약 불가 시간을 삭제했습니다.');
      fetchBlocks();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '예약 불가 시간 삭제에 실패했습니다.');
    }
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/api/owner/faq', {
        venue_id: Number(venueId),
        question: faqForm.question,
        answer: faqForm.answer,
        is_active: faqForm.is_active
      });
      setSuccess('FAQ를 등록했습니다.');
      setFaqForm({ question: '', answer: '', is_active: true });
      fetchFaqs();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'FAQ 등록에 실패했습니다.');
    }
  };

  const handleDeleteFaq = async (faqId) => {
    try {
      await api.delete(`/api/owner/faq/${faqId}`);
      setSuccess('FAQ를 삭제했습니다.');
      fetchFaqs();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'FAQ 삭제에 실패했습니다.');
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
          <p className="text-gray-500">업장을 불러오지 못했습니다.</p>
          <button
            onClick={() => navigate('/my-venues')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            내 업장으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{venue.venue_name}</h1>
            <p className="text-gray-600">{venue.description}</p>
          </div>
          <button
            onClick={() => navigate('/my-venues')}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            내 업장 목록
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">서비스 등록</h2>
            <form className="space-y-4" onSubmit={handleServiceSubmit}>
              <input
                type="text"
                placeholder="서비스명"
                value={serviceForm.service_name}
                onChange={(e) => setServiceForm({ ...serviceForm, service_name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <textarea
                placeholder="설명"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows="2"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="가격"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                  min="0"
                />
                <input
                  type="number"
                  placeholder="소요시간(분)"
                  value={serviceForm.duration_minutes}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                  min="1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="최소 인원"
                  value={serviceForm.min_party_size}
                  onChange={(e) => setServiceForm({ ...serviceForm, min_party_size: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                  min="1"
                />
                <input
                  type="number"
                  placeholder="최대 인원"
                  value={serviceForm.max_party_size}
                  onChange={(e) => setServiceForm({ ...serviceForm, max_party_size: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                  min={serviceForm.min_party_size || 1}
                />
                <input
                  type="number"
                  placeholder="보증금율(%) 선택"
                  value={serviceForm.deposit_rate_percent}
                  onChange={(e) => setServiceForm({ ...serviceForm, deposit_rate_percent: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                서비스 등록
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">영업시간 추가</h2>
            <form className="space-y-4" onSubmit={handleBusinessHourSubmit}>
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={hourForm.day_of_week}
                  onChange={(e) => setHourForm({ ...hourForm, day_of_week: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  {dayLabels.map((d, idx) => (
                    <option key={idx} value={idx}>{d}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={hourForm.open_time}
                  onChange={(e) => setHourForm({ ...hourForm, open_time: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  type="time"
                  value={hourForm.close_time}
                  onChange={(e) => setHourForm({ ...hourForm, close_time: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                영업시간 추가
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">예약 불가 시간 추가</h2>
          <form className="space-y-4" onSubmit={handleBlockSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={blockForm.block_date}
                onChange={(e) => setBlockForm({ ...blockForm, block_date: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                type="text"
                value={blockForm.reason}
                onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="사유 (선택)"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="time"
                step="1800"
                value={blockForm.start_time}
                onChange={(e) => setBlockForm({ ...blockForm, start_time: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                type="time"
                step="1800"
                value={blockForm.end_time}
                onChange={(e) => setBlockForm({ ...blockForm, end_time: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
              예약 불가 추가
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">등록된 서비스</h2>
          {services.length === 0 ? (
            <p className="text-gray-500">등록된 서비스가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <div key={svc.service_id} className="border rounded p-4">
                  <h3 className="font-semibold text-lg">{svc.service_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{svc.description}</p>
                  <p className="text-sm text-gray-600">가격: {svc.price?.toLocaleString()}원</p>
                  <p className="text-sm text-gray-600">소요시간: {svc.duration_minutes}분</p>
                  <p className="text-sm text-gray-600">인원: {svc.min_party_size ?? 1} ~ {svc.max_party_size ?? svc.capacity}명</p>
                  <p className="text-sm text-gray-600">보증금율: {svc.deposit_rate_percent ?? '기본'}%</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">영업시간 목록</h2>
          {businessHours.length === 0 ? (
            <p className="text-gray-500">등록된 영업시간이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {businessHours.map((bh) => (
                <div key={bh.business_hour_id} className="flex justify-between items-center border rounded p-3">
                  <div>
                    <p className="text-sm text-gray-700">요일: {dayLabels[bh.day_of_week]}</p>
                    <p className="text-sm text-gray-700">{bh.open_time} ~ {bh.close_time}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBusinessHour(bh.business_hour_id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">예약 불가 목록</h2>
          {blocks.length === 0 ? (
            <p className="text-gray-500">등록된 예약 불가 시간이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {blocks.map((b) => (
                <div key={b.block_id} className="flex justify-between items-center border rounded p-3">
                  <div>
                    <p className="text-sm text-gray-700">{b.block_date} {b.start_time} ~ {b.end_time}</p>
                    {b.reason && <p className="text-xs text-gray-500">{b.reason}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteBlock(b.block_id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">FAQ 관리</h2>
          <form className="space-y-3 mb-4" onSubmit={handleFaqSubmit}>
            <input
              type="text"
              placeholder="질문"
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <textarea
              placeholder="답변"
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows="3"
              required
            />
            <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={faqForm.is_active}
                onChange={(e) => setFaqForm({ ...faqForm, is_active: e.target.checked })}
              />
              <span>활성화</span>
            </label>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
              FAQ 등록
            </button>
          </form>
          {faqs.length === 0 ? (
            <p className="text-gray-500">등록된 FAQ가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {faqs.map((f) => (
                <div key={f.faq_id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{f.question}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{f.answer}</p>
                      <p className="text-xs text-gray-500 mt-1">{f.is_active ? '활성' : '비활성'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteFaq(f.faq_id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageVenue;
