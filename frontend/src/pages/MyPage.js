// frontend/src/pages/MyPage.js (clean rewrite)
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const MyPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyPage = async () => {
      try {
        const res = await api.get('/api/mypage');
        if (res.data.success) {
          const dto = res.data.data || {};
          setData({
            userId: dto.user_id || dto.userId,
            username: dto.username,
            realName: dto.real_name || dto.realName || dto.username,
            email: dto.email,
            phone: dto.phone,
            gradeName: dto.grade_name || dto.gradeName,
            gradeDiscountPercent: dto.grade_discount_percent ?? dto.gradeDiscountPercent,
            totalReservations: dto.total_reservations ?? dto.totalReservations ?? 0,
            completedReservations: dto.completed_reservations ?? dto.completedReservations ?? 0,
            noShowReservations: dto.no_show_reservations ?? dto.noShowReservations ?? 0,
            completionRate: dto.completion_rate ?? dto.completionRate ?? 0
          });
        } else {
          setError(res.data.message || '정보를 불러오지 못했습니다.');
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || '정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyPage();
  }, []);

  const displayName = data?.realName || data?.username || data?.email || data?.phone || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">마이페이지</h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">내 정보</h2>
              <p className="text-sm text-gray-700">이름: {displayName}</p>
              <p className="text-sm text-gray-700">아이디: {data?.username || '-'}</p>
              <p className="text-sm text-gray-700">이메일: {data?.email || '미등록'}</p>
              <p className="text-sm text-gray-700">전화번호: {data?.phone || '미등록'}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">등급 정보</h2>
              <p className="text-sm text-gray-700">등급: {data?.gradeName || '미배정'}</p>
              <p className="text-sm text-gray-700">
                보증금 할인율: {data?.gradeDiscountPercent != null ? `${data.gradeDiscountPercent}%` : '0%'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">예약 통계</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">총 예약</p>
                  <p className="text-2xl font-bold">{data?.totalReservations ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">완료</p>
                  <p className="text-2xl font-bold text-green-600">{data?.completedReservations ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">노쇼</p>
                  <p className="text-2xl font-bold text-red-600">{data?.noShowReservations ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">완료율</p>
                  <p className="text-2xl font-bold">{Math.round((data?.completionRate ?? 0) * 100)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
