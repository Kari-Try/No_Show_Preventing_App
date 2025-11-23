// frontend/src/pages/AuthCallback.js
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // 로컬 스토리지에 저장
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // 메인 페이지로 이동
        navigate('/');
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=callback_failed');
      }
    } else {
      navigate('/login?error=no_token');
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default AuthCallback;