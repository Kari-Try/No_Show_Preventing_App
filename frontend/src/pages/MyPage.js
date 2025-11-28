// frontend/src/pages/MyPage.js
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const gradeGuide = [
  { name: 'ELITE', discount: '20%', note: '노쇼 0회 전용' },
  { name: 'EXCELLENT', discount: '10%', note: '노쇼율 5% 이하' },
  { name: 'STANDARD', discount: '0%', note: '기본 등급, 노쇼율 20% 이하, 예약 4회까지 기본 등급으로 적용' },
  { name: 'POOR', discount: '0%', note: '노쇼율 초과 시 적용' },
];

const MyPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState('');

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
            completionRate: dto.completion_rate ?? dto.completionRate ?? 0,
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

    const fetchMyReviews = async () => {
      try {
        const res = await api.get('/api/reviews/my');
        if (res.data.success) {
          setReviews(res.data.data || []);
        } else {
          setReviewError(res.data.message || '리뷰를 불러오지 못했습니다.');
        }
      } catch (err) {
        console.error(err);
        setReviewError(err.response?.data?.message || '리뷰를 불러오지 못했습니다.');
      }
    };

    fetchMyPage();
    fetchMyReviews();
  }, []);

  const displayName = data?.realName || data?.username || data?.email || data?.phone || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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

            <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">등급별 할인 안내</h2>
              <div className="overflow-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-2 font-semibold text-gray-700">등급</th>
                      <th className="py-2 px-2 font-semibold text-gray-700">보증금 할인율</th>
                      <th className="py-2 px-2 font-semibold text-gray-700">조건/비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeGuide.map((g) => (
                      <tr key={g.name} className="border-b last:border-0">
                        <td className="py-2 px-2">{g.name}</td>
                        <td className="py-2 px-2">{g.discount}</td>
                        <td className="py-2 px-2 text-gray-600">{g.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">내 리뷰</h2>
                {reviewError && <span className="text-sm text-red-600">{reviewError}</span>}
              </div>
              {reviews.length === 0 ? (
                <p className="text-gray-500">작성한 리뷰가 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.review_id} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-2">{'★'.repeat(r.rating || 0)}</span>
                          <span className="text-sm text-gray-800">{r.venue_name || r.venueName || '업장 정보 없음'}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      {r.has_image && (
                        <div className="mb-2">
                          <img
                            src={`/api/reviews/${r.review_id}/image`}
                            alt="리뷰 이미지"
                            className="max-h-40 rounded"
                          />
                        </div>
                      )}
                      <p className="text-gray-800 whitespace-pre-wrap">{r.content}</p>
                      {r.owner_reply && (
                        <div className="mt-2 bg-gray-50 rounded p-2 text-sm text-gray-700">
                          <span className="font-semibold">점주 답변: </span>
                          {r.owner_reply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
