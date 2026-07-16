import api from './axios';

export const boardsApi = {
  getAll: (params) => api.get('/boards', { params }),
  getStats: () => api.get('/boards/stats'),
  getById: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.put(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
  toggleArchive: (id) => api.put(`/boards/${id}/archive`),
  exportBoard: (id) => api.get(`/boards/${id}/export`),
  importBoard: (data) => api.post('/boards/import', data),
  inviteCollaborator: (id, data) => api.post(`/boards/${id}/collaborators`, data),
  removeCollaborator: (id, userId) => api.delete(`/boards/${id}/collaborators/${userId}`),
  updateCollaboratorRole: (id, userId, role) => api.put(`/boards/${id}/collaborators/${userId}`, { role }),
};
