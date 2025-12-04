import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";

// 등급 안내 데이터
const gradeGuide = [
  { name: "ELITE", discount: "20%", note: "노쇼 0회 전용" },
  { name: "EXCELLENT", discount: "10%", note: "노쇼율 5% 이하" },
  { name: "STANDARD", discount: "0%", note: "기본 등급, 노쇼율 20% 이하" },
  { name: "POOR", discount: "0%", note: "노쇼율 초과 시 적용" },
];

// 공통 카드 스타일
const SectionCard = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-gray-100 p-8">
    {children}
  </div>
);

const MyPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const fetchMyPage = async () => {
      try {
        const res = await api.get("/api/mypage");

        if (res.data.success) {
          const dto = res.data.data || {};
          setData({
            userId: dto.user_id || dto.userId,
            username: dto.username,
            realName: dto.real_name || dto.realName || dto.username,
            email: dto.email,
            phone: dto.phone,
            gradeName: dto.grade_name || dto.gradeName,
            gradeDiscountPercent:
              dto.grade_discount_percent ?? dto.gradeDiscountPercent,
            totalReservations: dto.total_reservations ?? 0,
            completedReservations: dto.completed_reservations ?? 0,
            noShowReservations: dto.no_show_reservations ?? 0,
            completionRate: dto.completion_rate ?? 0,
          });
        } else {
          setError(res.data.message || "정보를 불러오지 못했습니다.");
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    const fetchMyReviews = async () => {
      try {
        const res = await api.get("/api/reviews/my");

        if (res.data.success) setReviews(res.data.data || []);
        else setReviewError("리뷰를 불러오지 못했습니다.");
      } catch (err) {
        console.error(err);
        setReviewError(err.response?.data?.message || "리뷰를 불러오지 못했습니다.");
      }
    };

    fetchMyPage();
    fetchMyReviews();
  }, []);

  const displayName =
    data?.realName || data?.username || data?.email || data?.phone || "";

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* 페이지 제목 */}
        <h1 className="text-4xl font-bold text-gray-900 mb-10 tracking-tight">
          마이페이지
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <SectionCard>
            <p className="text-red-600 text-lg font-medium">{error}</p>
          </SectionCard>
        ) : (
          <div className="space-y-10">

            {/* 1행: 정보 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SectionCard>
                <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
                  내 정보
                </h2>

                <div className="space-y-1">
                  <p className="text-[15px] text-gray-600 leading-relaxed">
                    이름: <span className="text-gray-800 font-medium">{displayName}</span>
                  </p>
                  <p className="text-[15px] text-gray-600 leading-relaxed">
                    아이디: <span className="text-gray-800 font-medium">{data?.username}</span>
                  </p>
                  <p className="text-[15px] text-gray-600 leading-relaxed">
                    이메일:{" "}
                    <span className="text-gray-800 font-medium">
                      {data?.email || "미등록"}
                    </span>
                  </p>
                  <p className="text-[15px] text-gray-600 leading-relaxed">
                    전화번호:{" "}
                    <span className="text-gray-800 font-medium">
                      {data?.phone || "미등록"}
                    </span>
                  </p>
                </div>
              </SectionCard>

              <SectionCard>
                <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
                  등급 정보
                </h2>

                <div className="space-y-1">
                  <p className="text-[15px] text-gray-600 leading-relaxed">
                    등급:{" "}
                    <span className="text-gray-800 font-medium">{data?.gradeName}</span>
                  </p>
                  <p className="text-[15px] text-gray-600 leading-relaxed">
                    보증금 할인율:{" "}
                    <span className="text-gray-800 font-medium">
                      {data?.gradeDiscountPercent ?? 0}%
                    </span>
                  </p>
                </div>
              </SectionCard>
            </div>

            {/* 예약 통계 */}
            <SectionCard>
              <h2 className="text-xl font-bold text-gray-800 mb-6 tracking-tight">
                예약 통계
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 text-center gap-6">
                <div>
                  <p className="text-sm text-gray-500">총 예약</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {data?.totalReservations}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">완료</p>
                  <p className="text-3xl font-bold text-green-600">
                    {data?.completedReservations}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">노쇼</p>
                  <p className="text-3xl font-bold text-red-500">
                    {data?.noShowReservations}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">완료율</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {Math.round((data?.completionRate ?? 0) * 100)}%
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* 등급 안내 */}
            <SectionCard>
              <h2 className="text-xl font-bold text-gray-800 mb-6 tracking-tight">
                등급별 할인 안내
              </h2>

              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 text-left text-gray-700 font-semibold">등급</th>
                    <th className="py-3 text-left text-gray-700 font-semibold">보증금 할인율</th>
                    <th className="py-3 text-left text-gray-700 font-semibold">조건/비고</th>
                  </tr>
                </thead>

                <tbody>
                  {gradeGuide.map((g) => (
                    <tr key={g.name} className="border-b last:border-0 text-gray-700">
                      <td className="py-3">{g.name}</td>
                      <td className="py-3">{g.discount}</td>
                      <td className="py-3 text-gray-600">{g.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>

            {/* 리뷰 */}
            <SectionCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                  내 리뷰
                </h2>
              </div>

              {reviewError && (
                <p className="text-sm text-red-600 mb-3">{reviewError}</p>
              )}

              {reviews.length === 0 ? (
                <p className="text-gray-500">작성한 리뷰가 없습니다.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((r) => (
                    <div key={r.review_id} className="border-b last:border-0 pb-4">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-2 text-lg">
                            {"★".repeat(r.rating || 0)}
                          </span>
                          <span className="text-gray-800 font-medium">
                            {r.venue_name}
                          </span>
                        </div>

                        <span className="text-xs text-gray-500">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {r.has_image && (
                        <img
                          src={`/api/reviews/${r.review_id}/image`}
                          className="max-h-40 rounded mb-3 shadow"
                          alt=""
                        />
                      )}

                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {r.content}
                      </p>

                      {r.owner_reply && (
                        <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm mt-2">
                          <span className="font-semibold">점주 답변: </span>
                          {r.owner_reply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
