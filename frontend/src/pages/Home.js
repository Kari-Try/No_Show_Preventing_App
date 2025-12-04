import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const isOwner = user?.roles?.includes("owner");

  const features = [
    { icon: "💳", title: "선결제 보증금 시스템", desc: "예약 신뢰도를 극대화하고 노쇼를 근본적으로 차단합니다." },
    { icon: "⭐", title: "우수고객 등급제", desc: "성실하게 이용하는 고객에게 보증금 할인 및 다양한 혜택 제공." },
    { icon: "📅", title: "간편 예약 · 실시간 관리", desc: "원클릭 예약과 직관적 운영 대시보드로 효율을 극대화합니다." }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-24 pb-20 text-center">
        <h1 className="text-5xl font-extrabold text-[#1f2d3d] leading-tight">
          노쇼 방지 예약 플랫폼
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-500 max-w-3xl mx-auto leading-snug font-light">
          보증금 기반 예약 시스템을 통해 신뢰도 높은 고객 확보와  
          안정적인 업장 운영을 동시에 실현하세요.
        </p>

        {/* ★ 버튼 두 개를 한 줄로 정렬한 핵심 부분 ★ */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">

          {/* 메인 버튼 */}
          <Link
            to="/venues"
            className="px-10 py-4 rounded-lg 
                       bg-[#4098ff] text-white text-lg font-semibold 
                       hover:bg-[#2f89f7] transition"
          >
            업장 둘러보기 🔍
          </Link>

          {/* 사장일 때만 표시 */}
          {isOwner && (
            <Link
              to="/my-venues"
              className="px-10 py-4 rounded-lg border text-gray-700 bg-white shadow-sm
                         hover:bg-gray-50 transition text-lg font-medium"
            >
              내 업장 관리
            </Link>
          )}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="w-full border-t border-[#e6edf5]"></div>

      {/* FEATURES */}
      <section className="py-20">
        <h2 className="text-center text-4xl font-bold text-[#1f2d3d]">
          핵심 기능
        </h2>

        <div className="mt-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 px-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-10 shadow-sm border border-[#e7edf2]
                         hover:shadow-md transition"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-[#1f2d3d]">{item.title}</h3>
              <p className="mt-3 text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
