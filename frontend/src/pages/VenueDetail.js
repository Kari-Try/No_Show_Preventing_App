// frontend/src/pages/VenueDetail.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";

// Swiper (이미지 슬라이더)
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Kakao Map
/* global kakao */

const dayLabel = ["일", "월", "화", "수", "목", "금", "토"];

const VenueDetail = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [images, setImages] = useState([]);
  const [averageRating, setAverageRating] = useState(null);

  const [reviewSort, setReviewSort] = useState("latest"); // 정렬 기능

  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [partySize, setPartySize] = useState(1);

  const [loading, setLoading] = useState(true);

  // 지도 위치
  const [mapLoaded, setMapLoaded] = useState(false);

  // ======================================================
  // Fetch All
  // ======================================================
  useEffect(() => {
    fetchVenueDetail();
    fetchServices();
    fetchReviews();
    fetchBusinessHours();
    fetchBlocks();
    fetchFaqs();
    fetchImages();
  }, [venueId]);

 // 업장 정보
  const fetchVenueDetail = async () => {
    try {
      const res = await api.get(`/api/venues/${venueId}`);
      if (res.data.success) {
        setVenue(res.data.data);
      }
    } catch (err) {
      console.error(err);
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

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/api/reviews/venue/${venueId}`);
      if (res.data.success) {
        const list = res.data.data || [];
        setReviews(list);

        if (list.length > 0) {
          const avg = (
            list.reduce((sum, r) => sum + (r.rating || 0), 0) / list.length
          ).toFixed(1);
          setAverageRating(avg);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      const res = await api.get(`/api/faq/venue/${venueId}`);
      if (res.data.success) setFaqs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchImages = async () => {
    try {
      const res = await api.get(`/api/venues/${venueId}/images`);
      if (res.data) setImages(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ======================================================
  // 지도 로드
  // ======================================================
  useEffect(() => {
  if (!venue?.address) return;

  // 1) SDK 스크립트 생성
  const script = document.createElement("script");
  script.src =
    "//dapi.kakao.com/v2/maps/sdk.js?appkey=1644000945747cd560f0bb8c664162be&autoload=false&libraries=services";
  script.async = true;


  script.onload = () => {
    // 2) SDK 로딩 완료 후 kakao.maps.load 실행
    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(venue.address, function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          const container = document.getElementById("venue-map");
          const map = new window.kakao.maps.Map(container, {
            center: coords,
            level: 3,
          });

          new window.kakao.maps.Marker({
            map: map,
            position: coords,
          });
        }
      });
    });
  };

  document.head.appendChild(script);
}, [venue]);

  // ======================================================
  // 리뷰 정렬
  // ======================================================
  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === "latest") return new Date(b.created_at) - new Date(a.created_at);
    if (reviewSort === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    if (reviewSort === "high") return b.rating - a.rating;
    if (reviewSort === "low") return a.rating - b.rating;
    return 0;
  });

  // ======================================================
  // 예약 생성
  // ======================================================
  const handleReservation = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    try {
      const scheduledStart = `${selectedDate}T${selectedTime}`;
      const res = await api.post("/api/reservations", {
        service_id: selectedService,
        scheduled_start: scheduledStart,
        party_size: partySize,
      });

      if (res.data.success) {
        alert("예약이 생성되었습니다.");
        navigate("/my-reservations");
      }
    } catch (err) {
      alert(err.response?.data?.message || "예약 실패");
    }
  };

  // ======================================================
  // UI
  // ======================================================

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
        </div>
      </div>
    );

  if (!venue)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-600">업장을 찾을 수 없습니다.</div>
      </div>
    );
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ======================================================
           이미지 슬라이더
        ====================================================== */}
        {images.length > 0 && (
          <div className="bg-white shadow rounded-xl p-4">
            <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{ clickable: true }}
              autoplay={{ delay: 2500 }}
              spaceBetween={20}
              slidesPerView={1}
            >
              {images.map((img) => (
                <SwiperSlide key={img.imageId || img.image_id}>
                  <img
                    src={`/api/venues/images/${img.imageId || img.image_id}`}
                    className="w-full h-64 object-cover rounded-lg"
                    alt="venue"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* ======================================================
           업장 기본 정보
        ====================================================== */}
        <div className="bg-white shadow rounded-xl p-6">
          <h1 className="text-3xl font-bold">{venue.venue_name}</h1>
          <p className="text-gray-600 mt-2">{venue.description}</p>

          {averageRating && (
            <div className="mt-3 text-yellow-500 text-lg font-semibold">★ {averageRating}</div>
          )}
        </div>

        {/* ======================================================
           지도 영역
        ====================================================== */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">위치</h2>
          <div id="venue-map" className="w-full h-72 rounded-lg"></div>
        </div>

        {/* ======================================================
           예약하기
        ====================================================== */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">예약하기</h2>

          <div className="space-y-4">

            <select
              className="w-full border px-3 py-2 rounded"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">서비스 선택</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.service_name} - {service.price.toLocaleString()}원
                </option>
              ))}
            </select>

            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              min={new Date().toISOString().slice(0, 10)}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <input
              type="time"
              className="w-full border px-3 py-2 rounded"
              step="1800"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />

            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              min="1"
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
              placeholder="인원"
            />

            <button
              onClick={handleReservation}
              className="w-full py-3 bg-[#4098ff] hover:bg-[#2f89f7] text-white rounded-lg font-semibold"
            >
              예약하기
            </button>
          </div>
        </div>

        {/* ======================================================
           리뷰 정렬 + 리뷰 리스트
        ====================================================== */}
        <div className="bg-white shadow rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">리뷰</h2>

            <select
              className="border px-2 py-1 rounded"
              value={reviewSort}
              onChange={(e) => setReviewSort(e.target.value)}
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="high">평점 높은순</option>
              <option value="low">평점 낮은순</option>
            </select>
          </div>

{sortedReviews.length === 0 ? (
  <p className="text-gray-500">등록된 리뷰가 없습니다.</p>
) : (
  <div className="space-y-6">
    {sortedReviews.map((r) => (
      <div key={r.review_id} className="border-b pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">{r.user?.real_name}</span>
          <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
        </div>

        {r.has_image && (
          <img
            src={`/api/reviews/${r.review_id}/image`}
            className="w-full max-h-56 rounded mb-2 object-cover"
            alt="review"
          />
        )}

        <p className="text-gray-700 whitespace-pre-wrap">{r.content}</p>

        {r.owner_reply && (
          <div className="mt-3 bg-gray-50 border rounded p-3 text-sm">
            <p className="font-semibold text-gray-700">사장 댓글</p>
            <p className="text-gray-800 whitespace-pre-wrap">{r.owner_reply}</p>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-2">
          {new Date(r.created_at).toLocaleDateString()}
        </p>
      </div>
    ))}
  </div>
)}

        </div>

        {/* ======================================================
           FAQ
        ====================================================== */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">FAQ</h2>

          {faqs.length === 0 ? (
            <p className="text-gray-500">FAQ가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {faqs.map((f) => (
                <div key={f.faq_id}>
                  <p className="font-semibold">{f.question}</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{f.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;
