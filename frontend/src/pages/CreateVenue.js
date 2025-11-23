// frontend/src/pages/CreateVenue.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const CreateVenue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    venue_name: '',
    description: '',
    base_price: '',
    default_deposit_rate_percent: '30',
    address: '',
    address_detail: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.venue_name.trim()) {
      alert('업장명을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/venues', {
        ...formData,
        base_price: formData.base_price ? parseFloat(formData.base_price) : null,
        default_deposit_rate_percent: parseFloat(formData.default_deposit_rate_percent)
      });

      if (response.data.success) {
        alert('업장이 등록되었습니다.');
        navigate('/my-venues');
      }
    } catch (error) {
      console.error('Create venue error:', error);
      alert(error.response?.data?.message || '업장 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">업장 등록</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                업장명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="venue_name"
                value={formData.venue_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 카페 블루밍"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="업장에 대한 설명을 입력하세요"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기본 가격 (원)
                </label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보증금 비율 (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="default_deposit_rate_percent"
                  value={formData.default_deposit_rate_percent}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주소
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 서울시 강남구 테헤란로 123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 주소
              </label>
              <input
                type="text"
                name="address_detail"
                value={formData.address_detail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 2층 201호"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/my-venues')}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVenue;