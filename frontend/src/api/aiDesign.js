import api from './axios';

export const aiDesignApi = {
  getBoardRecommendations: (boardId) => api.get(`/ai-design/board/${boardId}`),
  analyzeImage: (imageUrl) => api.post('/ai-design/analyze-image', { imageUrl }),
};
