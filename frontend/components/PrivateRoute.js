// frontend/components/PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

const PrivateRoute = ({ children, roles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await api.get('/auth/verify');
        if (response.data.success) {
          setIsAuthenticated(true);
          setUserRoles(response.data.user.roles || []);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const hasRole = roles.some(role => userRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;