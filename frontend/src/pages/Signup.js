// frontend/src/pages/Signup.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8000";

// 네이버 로고 SVG
const NaverLogo = (props) => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="white" {...props}>
    <path d="M13.5 10l-3.5-6h-3.5v12h3.5v-6l3.5 6h3.5v-12h-3.5z" />
  </svg>
);

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("terms");
  const [termsChecked, setTermsChecked] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    userType: "customer",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("아이디를 입력해주세요.");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("전화번호를 입력해주세요.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }
    if (formData.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return false;
    }
    if (!/^010-\d{4}-\d{4}$/.test(formData.phone)) {
      setError("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/auth/signup`,
        {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          user_type: formData.userType,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        alert("회원가입이 완료되었습니다.");
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "회원가입에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNaverSignup = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/naver`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const redirectUrl = response.data.data?.url || response.data.url;
        window.location.href = redirectUrl || "/login";
      }
    } catch (err) {
      setError("네이버 로그인 연결에 실패했습니다.");
    }
  };

  // ============================================================
  // STEP 1 — 약관 동의 페이지
  // ============================================================
  if (step === "terms") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
        <div className="max-w-lg w-full bg-white p-10 rounded-xl shadow-2xl space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            이용약관 동의
          </h2>

          <div className="h-60 overflow-y-auto bg-gray-50 border rounded-md p-4 text-sm space-y-4 leading-relaxed">
            <div>
              <h3 className="font-semibold mb-1 text-gray-800">서비스 이용약관</h3>
              <p className="text-gray-600">
                본 서비스는 보증금 기반 노쇼 방지 예약 시스템을 제공합니다.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1 text-gray-800">개인정보 처리방침</h3>
              <p className="text-gray-600">
                예약 및 회원 관리를 위해 이름, 전화번호 등을 수집하며 안전하게 보관합니다.
              </p>
            </div>
          </div>

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
            />
            <span className="text-gray-700">
              위 약관 및 개인정보 처리방침에 동의합니다.
            </span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            onClick={() => {
              if (!termsChecked) {
                setError("약관 동의가 필요합니다.");
                return;
              }
              setError("");
              setStep("form");
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            동의하고 계속하기
          </button>

          <div className="text-center text-sm">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              이미 계정이 있으신가요? 로그인
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // STEP 2 — 실제 회원가입 폼 페이지 (로그인 UI 동일 스타일)
  // ============================================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-2xl space-y-8">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          회원가입
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* 회원 유형 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              회원 유형
            </label>
            <div className="mt-2 flex gap-6">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  value="customer"
                  name="userType"
                  checked={formData.userType === "customer"}
                  onChange={handleChange}
                  className="mr-2"
                />
                고객
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  value="owner"
                  name="userType"
                  checked={formData.userType === "owner"}
                  onChange={handleChange}
                  className="mr-2"
                />
                업체
              </label>
            </div>
          </div>

          {/* 이름 */}
          <InputField
            id="name"
            label="이름"
            value={formData.name}
            onChange={handleChange}
          />

          {/* 아이디 */}
          <InputField
            id="username"
            label="아이디"
            value={formData.username}
            onChange={handleChange}
          />

          {/* 이메일 (선택) */}
          <InputField
            id="email"
            label="이메일 (선택)"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          {/* 전화번호 */}
          <InputField
            id="phone"
            label="전화번호"
            placeholder="010-1234-5678"
            value={formData.phone}
            onChange={handleChange}
          />

          {/* 비밀번호 */}
          <InputField
            id="password"
            label="비밀번호"
            type="password"
            placeholder="8자 이상"
            value={formData.password}
            onChange={handleChange}
          />

          {/* 비밀번호 확인 */}
          <InputField
            id="confirmPassword"
            label="비밀번호 확인"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>

          {/* 구분선 */}
          <Divider label="또는" />

          {/* 네이버 회원가입 */}
          <button
            type="button"
            onClick={handleNaverSignup}
            className="w-full flex justify-center items-center py-3 bg-[#03C75A] text-white rounded-lg font-semibold hover:bg-[#02B852] transition"
          >
            <NaverLogo /> 네이버로 가입
          </button>

          {/* 로그인 링크 */}
          <div className="text-center text-sm">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              이미 계정이 있으신가요? 로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------
// 재사용 Input 컴포넌트
// ---------------------
const InputField = ({
  id,
  label,
  type = "text",
  value,
  placeholder,
  onChange,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      required={type !== "email"} // 이메일은 선택사항
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="
        mt-1 block w-full px-4 py-2 border border-gray-300 
        rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 
        focus:border-blue-500 transition
      "
    />
  </div>
);

// ---------------------
// 구분선 Divider 컴포넌트
// ---------------------
const Divider = ({ label }) => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-gray-500">{label}</span>
    </div>
  </div>
);

export default Signup;
