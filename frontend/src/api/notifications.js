import api from './axios';

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications'),
};
