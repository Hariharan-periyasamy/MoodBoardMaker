import api from './axios';

export const shareApi = {
  enable: (boardId) => api.post(`/share/${boardId}`),
  disable: (boardId) => api.delete(`/share/${boardId}`),
  regenerate: (boardId) => api.post(`/share/regenerate/${boardId}`),
  getSharedBoard: (token) => api.get(`/share/${token}`),
};
