import api from './axios';

export const activityApi = {
  getAll: (params) => api.get('/activity', { params }),
};
