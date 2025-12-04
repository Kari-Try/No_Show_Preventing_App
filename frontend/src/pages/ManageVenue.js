import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";

const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

const ManageVenue = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();

  // STATE -------------------------------
  const [venue, setVenue] = useState(null);
  const [services, setServices] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [images, setImages] = useState([]);

  const [serviceForm, setServiceForm] = useState({
    service_name: "",
    description: "",
    price: "",
    duration_minutes: 60,
    min_party_size: 1,
    max_party_size: 1,
    deposit_rate_percent: "",
  });

  const [hourForm, setHourForm] = useState({
    day_of_week: 1,
    open_time: "09:00",
    close_time: "18:00",
  });

  const [blockForm, setBlockForm] = useState({
    block_date: "",
    start_time: "",
    end_time: "",
    reason: "",
  });

  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    is_active: true,
  });

  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // FETCH --------------------------------
  useEffect(() => {
    fetchVenue();
    fetchServices();
    fetchBusinessHours();
    fetchBlocks();
    fetchFaqs();
    fetchImages();
  }, [venueId]);

  const fetchVenue = async () => {
    try {
      const res = await api.get(`/api/venues/${venueId}`);
      if (res.data.success) setVenue(res.data.data);
    } catch {
      setError("업장 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get(`/api/services/venue/${venueId}`);
      if (res.data.success) setServices(res.data.data || []);
    } catch {}
  };

  const fetchBusinessHours = async () => {
    try {
      const res = await api.get(`/api/services/venue/${venueId}/business-hours`);
      if (res.data.success) setBusinessHours(res.data.data || []);
    } catch {}
  };

  const fetchBlocks = async () => {
    try {
      const res = await api.get(`/api/services/venue/${venueId}/blocks`);
      if (res.data.success) setBlocks(res.data.data || []);
    } catch {}
  };

  const fetchFaqs = async () => {
    try {
      const res = await api.get(`/api/owner/faq/${venueId}`);
      if (res.data.success) setFaqs(res.data.data || []);
    } catch {}
  };

  const fetchImages = async () => {
    try {
      const res = await api.get(`/api/owner/venues/${venueId}/images`);
      if (res.data.success) setImages(res.data.data || res.data || []);
    } catch {}
  };

  // HANDLERS -------------------------------
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {
        venue_id: Number(venueId),
        ...serviceForm,
        price: Number(serviceForm.price),
        duration_minutes: Number(serviceForm.duration_minutes),
        min_party_size: Number(serviceForm.min_party_size),
        max_party_size: Number(serviceForm.max_party_size),
        deposit_rate_percent:
          serviceForm.deposit_rate_percent !== ""
            ? Number(serviceForm.deposit_rate_percent)
            : null,
      };
      const res = await api.post("/api/owner/services", payload);
      if (res.data.success) {
        setSuccess("서비스 등록 완료");
        setServiceForm({
          service_name: "",
          description: "",
          price: "",
          duration_minutes: 60,
          min_party_size: 1,
          max_party_size: 1,
          deposit_rate_percent: "",
        });
        fetchServices();
      }
    } catch {
      setError("서비스 등록 실패");
    }
  };

  const handleBusinessHourSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    try {
      await api.post(`/api/owner/venues/${venueId}/business-hours`, {
        ...hourForm,
        day_of_week: Number(hourForm.day_of_week),
      });
      setSuccess("영업시간 추가 완료");
      fetchBusinessHours();
    } catch {
      setError("영업시간 추가 실패");
    }
  };

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/owner/venues/${venueId}/blocks`, blockForm);
      setSuccess("예약 불가 등록 완료");
      fetchBlocks();
    } catch {
      setError("예약 불가 등록 실패");
    }
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/owner/faq", {
        venue_id: Number(venueId),
        ...faqForm,
      });
      setSuccess("FAQ 등록 완료");
      setFaqForm({ question: "", answer: "", is_active: true });
      fetchFaqs();
    } catch {
      setError("FAQ 등록 실패");
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) return;
    try {
      const form = new FormData();
      form.append("image", imageFile);

      const res = await api.post(
        `/api/owner/venues/${venueId}/images`,
        form
      );
      if (res.data.success) {
        setSuccess("이미지 업로드 완료");
        fetchImages();
      }
    } catch {
      setError("이미지 업로드 실패");
    }
  };

  // UI COMPONENTS -------------------------------
  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-5 py-2 rounded-md text-sm font-semibold border transition
        ${
          activeTab === id
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-gray-600 border-indigo-300 hover:bg-indigo-50"
        }`}
    >
      {label}
    </button>
  );

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );

  // MAIN UI -------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{venue?.venue_name}</h1>
            <p className="text-gray-600">{venue?.description}</p>
          </div>

          <button
            onClick={() => navigate("/my-venues")}
            className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
          >
            돌아가기
          </button>
        </div>

        {/* FEEDBACK */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* TABS */}
        <div className="flex space-x-2 mb-6">
          <TabButton id="services" label="서비스" />
          <TabButton id="hours" label="영업시간" />
          <TabButton id="blocks" label="예약 불가" />
          <TabButton id="faq" label="FAQ" />
          <TabButton id="images" label="이미지" />
        </div>

        {/* ======================================================
        =============== SERVICES TAB ============================
        ======================================================= */}
        {activeTab === "services" && (
          <div className="space-y-6">

            {/* 서비스 등록 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">서비스 등록</h2>

              <form className="space-y-4" onSubmit={handleServiceSubmit}>
                <input
                  className="w-full px-3 py-2 border rounded"
                  placeholder="서비스명"
                  value={serviceForm.service_name}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, service_name: e.target.value })
                  }
                />

                <textarea
                  className="w-full px-3 py-2 border rounded"
                  placeholder="설명"
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, description: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="px-3 py-2 border rounded"
                    placeholder="가격"
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: e.target.value })
                    }
                  />
                  <input
                    className="px-3 py-2 border rounded"
                    placeholder="소요시간(분)"
                    type="number"
                    value={serviceForm.duration_minutes}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        duration_minutes: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="px-3 py-2 border rounded"
                    placeholder="최소 인원"
                    type="number"
                    value={serviceForm.min_party_size}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        min_party_size: e.target.value,
                      })
                    }
                  />
                  <input
                    className="px-3 py-2 border rounded"
                    placeholder="최대 인원"
                    type="number"
                    value={serviceForm.max_party_size}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        max_party_size: e.target.value,
                      })
                    }
                  />
                </div>

                <input
                  className="w-full px-3 py-2 border rounded"
                  placeholder="보증금율(%)"
                  type="number"
                  value={serviceForm.deposit_rate_percent}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      deposit_rate_percent: e.target.value,
                    })
                  }
                />

                <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                  등록하기
                </button>
              </form>
            </div>

            {/* 서비스 목록 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">등록된 서비스</h3>

              {services.length === 0 ? (
                <p className="text-gray-500">등록된 서비스가 없습니다.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((svc) => (
                    <div key={svc.service_id} className="border rounded p-4 shadow-sm">
                      <h3 className="text-lg font-semibold">{svc.service_name}</h3>
                      <p className="text-sm text-gray-600">{svc.description}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        가격: {svc.price?.toLocaleString()}원
                      </p>
                      <p className="text-sm text-gray-700">
                        시간: {svc.duration_minutes}분
                      </p>
                      <p className="text-sm text-gray-700">
                        인원: {svc.min_party_size} ~ {svc.max_party_size}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================
        =============== HOURS TAB ==============================
        ======================================================= */}
        {activeTab === "hours" && (
          <div className="space-y-6">

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">영업시간 추가</h3>

              <form className="space-y-4" onSubmit={handleBusinessHourSubmit}>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    className="border rounded px-3 py-2"
                    value={hourForm.day_of_week}
                    onChange={(e) =>
                      setHourForm({ ...hourForm, day_of_week: e.target.value })
                    }
                  >
                    {dayLabels.map((label, idx) => (
                      <option key={idx} value={idx}>{label}</option>
                    ))}
                  </select>

                  <input
                    className="border rounded px-3 py-2"
                    type="time"
                    value={hourForm.open_time}
                    onChange={(e) =>
                      setHourForm({ ...hourForm, open_time: e.target.value })
                    }
                  />

                  <input
                    className="border rounded px-3 py-2"
                    type="time"
                    value={hourForm.close_time}
                    onChange={(e) =>
                      setHourForm({ ...hourForm, close_time: e.target.value })
                    }
                  />
                </div>

                <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                  등록
                </button>
              </form>
            </div>

            {/* 목록 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">영업시간 목록</h3>

              {businessHours.length === 0 ? (
                <p className="text-gray-500">등록된 시간이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {businessHours.map((bh) => (
                    <div
                      key={bh.business_hour_id}
                      className="flex justify-between items-center border rounded p-3"
                    >
                      <div>
                        <p className="font-medium">{dayLabels[bh.day_of_week]}</p>
                        <p className="text-sm">
                          {bh.open_time} ~ {bh.close_time}
                        </p>
                      </div>

                      <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================
        =============== BLOCKS TAB =============================
        ======================================================= */}
        {activeTab === "blocks" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">예약 불가 추가</h3>

              <form className="space-y-4" onSubmit={handleBlockSubmit}>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded"
                  value={blockForm.block_date}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, block_date: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    className="w-full px-3 py-2 border rounded"
                    value={blockForm.start_time}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, start_time: e.target.value })
                    }
                  />
                  <input
                    type="time"
                    className="w-full px-3 py-2 border rounded"
                    value={blockForm.end_time}
                    onChange={(e) =>
                      setBlockForm({ ...blockForm, end_time: e.target.value })
                    }
                  />
                </div>

                <input
                  type="text"
                  placeholder="사유 (선택)"
                  className="w-full px-3 py-2 border rounded"
                  value={blockForm.reason}
                  onChange={(e) =>
                    setBlockForm({ ...blockForm, reason: e.target.value })
                  }
                />

                <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                  등록
                </button>
              </form>
            </div>

            {/* 목록 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">예약 불가 목록</h3>

              {blocks.length === 0 ? (
                <p className="text-gray-500">등록된 항목이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {blocks.map((b) => (
                    <div
                      key={b.block_id}
                      className="flex justify-between items-center border rounded p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {b.block_date} {b.start_time} ~ {b.end_time}
                        </p>
                        {b.reason && (
                          <p className="text-xs text-gray-500">{b.reason}</p>
                        )}
                      </div>

                      <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================
        =============== FAQ TAB ================================
        ======================================================= */}
        {activeTab === "faq" && (
          <div className="space-y-6">

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">FAQ 등록</h3>

              <form className="space-y-4" onSubmit={handleFaqSubmit}>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="질문"
                  value={faqForm.question}
                  onChange={(e) =>
                    setFaqForm({ ...faqForm, question: e.target.value })
                  }
                />

                <textarea
                  className="w-full border rounded px-3 py-2"
                  placeholder="답변"
                  rows={3}
                  value={faqForm.answer}
                  onChange={(e) =>
                    setFaqForm({ ...faqForm, answer: e.target.value })
                  }
                />

                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={faqForm.is_active}
                    onChange={(e) =>
                      setFaqForm({
                        ...faqForm,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  <span>활성화</span>
                </label>

                <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                  등록
                </button>
              </form>
            </div>

            {/* FAQ LIST */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">FAQ 목록</h3>

              {faqs.length === 0 ? (
                <p className="text-gray-500">등록된 FAQ가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {faqs.map((f) => (
                    <div key={f.faq_id} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{f.question}</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {f.answer}
                          </p>
                        </div>

                        <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================
        =============== IMAGES TAB =============================
        ======================================================= */}
        {activeTab === "images" && (
          <div className="space-y-6">

            {/* 업로드 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">이미지 업로드</h3>

              <form onSubmit={handleImageUpload} className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border rounded px-3 py-2"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />

                <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                  업로드
                </button>
              </form>
            </div>

            {/* 목록 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">등록된 이미지</h3>

              {images.length === 0 ? (
                <p className="text-gray-500">이미지가 없습니다.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.imageId || img.image_id}
                      className="border rounded p-2"
                    >
                      <img
                        src={`/api/venues/images/${img.imageId || img.image_id}`}
                        className="w-full h-24 rounded object-cover"
                        alt="업장 이미지"
                      />
                      <button className="w-full mt-2 bg-red-600 text-white text-sm py-1 rounded hover:bg-red-700">
                        삭제
                      </button>
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

export default ManageVenue;
