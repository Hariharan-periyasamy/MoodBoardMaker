import api from './axios';

export const tilesApi = {
  getAll: (boardId) => api.get('/tiles', { params: { boardId } }),
  getById: (id) => api.get(`/tiles/${id}`),
  create: (data) => api.post('/tiles', data),
  update: (id, data) => api.put(`/tiles/${id}`, data),
  delete: (id) => api.delete(`/tiles/${id}`),
  duplicate: (id) => api.post(`/tiles/duplicate/${id}`),
  reorder: (tiles) => api.put('/tiles/reorder', { tiles }),
  upload: (formData, onUploadProgress) =>
    api.post('/tiles/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }),
  extractPalette: (id) => api.post(`/tiles/${id}/palette`),
  downloadProxyUrl: (url) => api.get('/tiles/proxy-download', { params: { url }, responseType: 'blob' }),
};
