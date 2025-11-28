// frontend/src/pages/MyVenues.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

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
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await api.get('/api/venues', {
        params: { page: 1, limit: 100 }
      });
      
      if (response.data.success) {
        const myVenues = response.data.data.filter(
          venue => venue.owner_user_id === user.user_id
        );
        setVenues(myVenues);
      }
    } catch (error) {
      console.error('Fetch my venues error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenue = async () => {
    try {
      const response = await api.delete(`/api/venues/${selectedVenue.venue_id}`);
      
      if (response.data.success) {
        alert('업장이 삭제되었습니다.');
        setShowDeleteModal(false);
        setSelectedVenue(null);
        fetchMyVenues();
      }
    } catch (error) {
      console.error('Delete venue error:', error);
      alert(error.response?.data?.message || '업장 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">내 업장</h1>
          <Link
            to="/venues/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            업장 등록
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">등록된 업장이 없습니다.</p>
            <Link
              to="/venues/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              업장 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div
                key={venue.venue_id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {venue.venue_name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {venue.description || '설명이 없습니다.'}
                  </p>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">보증금 비율: </span>
                    <span className="text-sm font-medium">
                      {venue.default_deposit_rate_percent}%
                    </span>
                  </div>
                  {venue.services && venue.services.length > 0 && (
                    <div className="mb-4 pt-4 border-t">
                      <p className="text-sm text-gray-500">
                        {venue.services.length}개의 서비스
                      </p>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Link
                      to={`/owner/venues/${venue.venue_id}/manage`}
                      className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      관리
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedVenue(venue);
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">업장 삭제</h3>
            <p className="text-gray-600 mb-4">
              "{selectedVenue?.venue_name}" 업장을 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedVenue(null);
                }}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteVenue}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
