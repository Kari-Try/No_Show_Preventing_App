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
      const res = await api.get('/api/venues', {
        params: { page, limit: 9, search },
      });

      if (res.data.success) {
        setVenues(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Fetch venues error:', err);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">업장 목록</h1>

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="업장명을 입력하세요"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm"
            >
              검색
            </button>
          </form>
        </div>

        {/* 로딩 */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-300 border-t-indigo-600"></div>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 카드 리스트 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {venues.map((venue) => (
                <Link
                  key={venue.venue_id}
                  to={`/venues/${venue.venue_id}`}
                  className="bg-white rounded-xl shadow hover:shadow-lg hover:-translate-y-1 transform transition-all border border-gray-100"
                >
                  <div className="p-6">
                    {/* 업장명 */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {venue.venue_name}
                    </h3>

                    {/* 설명 */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {venue.description || '설명이 없습니다.'}
                    </p>

                    {/* 주소 + 가격 */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-500">
                        {venue.address || '주소 정보 없음'}
                      </span>

                      {venue.base_price && (
                        <span className="text-lg font-bold text-indigo-600">
                          {venue.base_price.toLocaleString()}원~
                        </span>
                      )}
                    </div>

                    {/* 제공 서비스 수 */}
                    {venue.services?.length > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          {venue.services.length}개의 서비스 제공
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-3">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  이전
                </button>

                <span className="px-4 py-2 text-gray-700 font-medium">
                  {page} / {pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
