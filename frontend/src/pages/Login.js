import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// API_URL은 실제 서버 주소에 맞게 설정해야 합니다.
const API_URL = 'http://localhost:8000';

// 네이버 로고 SVG (편의상 인라인으로 정의)
const NaverLogo = (props) => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="white" {...props}>
    <path d="M13.5 10l-3.5-6h-3.5v12h3.5v-6l3.5 6h3.5v-12h-3.5z" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('email'); // email | username | phone
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 실제 로그인 로직 (이전 코드와 동일)
    try {
      let identifier = '';
      if (loginMethod === 'email') {
        identifier = formData.email.trim();
      } else if (loginMethod === 'username') {
        identifier = formData.username.trim();
      } else {
        identifier = formData.phone.trim();
      }

      if (!identifier) {
        setError('로그인 정보를 입력해주세요.');
        setLoading(false);
        return;
      }

      // ** API 호출 부분은 실제 환경에 맞게 수정해주세요 **
      const response = await axios.post(`${API_URL}/auth/login`, {
        identifier,
        password: formData.password
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const payload = response.data.data || response.data;
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다. 정보를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleNaverLogin = async () => {
     // 실제 네이버 로그인 리디렉션 로직 (이전 코드와 동일)
    try {
      const response = await axios.get(`${API_URL}/auth/naver`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const redirectUrl = response.data.data?.url || response.data.url;
        window.location.href = redirectUrl || '/login';
      }
    } catch (err) {
      setError('네이버 로그인 연결에 실패했습니다.');
    }
  };

  const loginMethods = [
    { key: 'email', label: '이메일', name: 'email', type: 'email', placeholder: 'example@email.com' },
    { key: 'username', label: '아이디', name: 'username', type: 'text', placeholder: 'myid' },
    { key: 'phone', label: '전화번호', name: 'phone', type: 'tel', placeholder: '010-1234-5678' }
  ];

  const currentMethod = loginMethods.find(m => m.key === loginMethod);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl transition duration-300">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            예약 플랫폼 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            환영합니다.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm transition duration-300">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Login Method Tab UI - 간결화 및 명확화 */}
            <div className="flex border-b border-gray-200 mb-6">
              {loginMethods.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => { setLoginMethod(m.key); setError(''); }}
                  className={`py-2 px-4 text-sm font-semibold border-b-2 transition duration-200 ease-in-out
                    ${loginMethod === m.key 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Identifier Input */}
            {currentMethod && (
              <div>
                <label htmlFor={currentMethod.name} className="block text-sm font-medium text-gray-700">
                  {currentMethod.label}
                </label>
                <input
                  id={currentMethod.name}
                  name={currentMethod.name}
                  type={currentMethod.type}
                  required
                  value={formData[currentMethod.name]}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  placeholder={currentMethod.placeholder}
                />
              </div>
            )}

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end text-sm">
            <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              비밀번호 찾기
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition duration-150 ease-in-out"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  로그인 중...
                </div>
              ) : '로그인'}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">다른 방법으로 로그인</span>
            </div>
          </div>

          {/* Naver Login Button - 스타일 강화 */}
          <div>
            <button
              type="button"
              onClick={handleNaverLogin}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#03C75A] hover:bg-[#02B852] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#03C75A] transition duration-150 ease-in-out"
            >
              <NaverLogo />
              네이버로 로그인
            </button>
          </div>

          <div className="text-center text-sm mt-4">
            계정이 없으신가요? 
            <Link to="/signup" className="ml-1 font-medium text-blue-600 hover:text-blue-500">
              회원가입하기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;