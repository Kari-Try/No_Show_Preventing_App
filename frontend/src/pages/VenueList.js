// frontend/src/pages/VenueList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const VenueList = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchVenues();
  }, [page, search]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/venues', {
        params: { page, limit: 9, search }
      });
      
      if (response.data.success) {
        setVenues(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Fetch venues error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVenues();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">업장 목록</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="업장명 검색"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              검색
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">등록된 업장이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <Link
                  key={venue.venue_id}
                  to={`/venues/${venue.venue_id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {venue.venue_name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {venue.description || '설명이 없습니다.'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {venue.address || '주소 정보 없음'}
                      </span>
                      {venue.base_price && (
                        <span className="text-lg font-bold text-blue-600">
                          {venue.base_price.toLocaleString()}원~
                        </span>
                      )}
                    </div>
                    {venue.services && venue.services.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          {venue.services.length}개의 서비스 제공
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                <span className="px-4 py-2">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VenueList;