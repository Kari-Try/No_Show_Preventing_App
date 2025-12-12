import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";

const VenueCard = ({ venue, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all duration-200">
      <div className="p-7">
        <h3 className="text-[20px] font-bold text-gray-900 tracking-tight mb-1">
          {venue.venue_name}
        </h3>

        <p className="text-[15px] text-gray-600 leading-relaxed line-clamp-2 mb-3">
          {venue.description || "설명이 없습니다."}
        </p>

        <div className="flex items-center text-[14px] text-gray-500 mb-5">
          보증금 비율:&nbsp;
          <span className="font-semibold text-gray-800">
            {venue.default_deposit_rate_percent}%
          </span>
        </div>

        {venue.services && venue.services.length > 0 && (
          <div className="pt-4 border-t border-gray-200 mb-5">
            <p className="text-[14px] text-gray-500">
              {venue.services.length}개의 서비스 등록됨
            </p>
          </div>
        )}

        {/* 버튼 그룹 */}
        <div className="flex gap-3">
          <Link
            to={`/owner/venues/${venue.venue_id}/manage`}
            className="flex-1 text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            관리
          </Link>
          <button
            onClick={() => onDelete(venue)}
            className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

const MyVenues = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchMyVenues();
  }, []);

  const fetchMyVenues = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await api.get("/api/venues", {
        params: { page: 1, limit: 100 },
      });

      if (response.data.success) {
        const myVenues = response.data.data.filter(
          (venue) => venue.owner_user_id === user.user_id
        );
        setVenues(myVenues);
      }
    } catch (error) {
      console.error("Fetch my venues error:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenue = async () => {
    try {
      const res = await api.delete(
        `/api/venues/${selectedVenue.venue_id}`
      );

      if (res.data.success) {
        setShowDeleteModal(false);
        setSelectedVenue(null);
        fetchMyVenues();
      }
    } catch (error) {
      alert(error.response?.data?.message || "업장 삭제 실패");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            내 업장
          </h1>
          <Link
            to="/venues/create"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + 업장 등록
          </Link>
        </div>

        {/* 로딩 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-gray-100">
            <p className="text-gray-500 text-lg mb-6">
              등록된 업장이 없습니다.
            </p>
            <Link
              to="/venues/create"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              업장 등록하기
            </Link>
          </div>
        ) : (
          // 카드 리스트
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {venues.map((venue) => (
              <VenueCard
                key={venue.venue_id}
                venue={venue}
                onDelete={(v) => {
                  setSelectedVenue(v);
                  setShowDeleteModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 삭제 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-7 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              업장 삭제
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              "{selectedVenue?.venue_name}" 업장을 삭제하시겠습니까?  
              <br />
              이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={handleDeleteVenue}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVenues;
