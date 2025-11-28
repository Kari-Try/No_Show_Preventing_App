// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

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
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/naver`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // 네이버 로그인 페이지로 리다이렉트
        const redirectUrl = response.data.data?.url || response.data.url;
        window.location.href = redirectUrl || '/login';
      }
    } catch (err) {
      setError('네이버 로그인 연결에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            노쇼 방지 플랫폼
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                로그인 방식
              </label>
              <div className="flex space-x-4 mt-2">
                <label className="flex items-center space-x-1 text-sm">
                  <input
                    type="radio"
                    name="loginMethod"
                    value="email"
                    checked={loginMethod === 'email'}
                    onChange={() => setLoginMethod('email')}
                  />
                  <span>이메일</span>
                </label>
                <label className="flex items-center space-x-1 text-sm">
                  <input
                    type="radio"
                    name="loginMethod"
                    value="username"
                    checked={loginMethod === 'username'}
                    onChange={() => setLoginMethod('username')}
                  />
                  <span>아이디</span>
                </label>
                <label className="flex items-center space-x-1 text-sm">
                  <input
                    type="radio"
                    name="loginMethod"
                    value="phone"
                    checked={loginMethod === 'phone'}
                    onChange={() => setLoginMethod('phone')}
                  />
                  <span>전화번호</span>
                </label>
              </div>
            </div>

            {loginMethod === 'email' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example@email.com"
                />
              </div>
            )}

            {loginMethod === 'username' && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  아이디
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="myid"
                />
              </div>
            )}

            {loginMethod === 'phone' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  전화번호
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="010-1234-5678"
                />
              </div>
            )}

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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleNaverLogin}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.5 10l-3.5-6h-3.5v12h3.5v-6l3.5 6h3.5v-12h-3.5z"/>
              </svg>
              네이버로 로그인
            </button>
          </div>

          <div className="text-center">
            <Link to="/signup" className="text-sm text-blue-600 hover:text-blue-500">
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
