import api from '../utils/api';

// 공개 조회 엔드포인트 경로에 맞춰 호출
export const fetchBusinessHours = (venueId) => api.get(`/api/services/venue/${venueId}/business-hours`);
export const fetchBlocks = (venueId) => api.get(`/api/services/venue/${venueId}/blocks`);
