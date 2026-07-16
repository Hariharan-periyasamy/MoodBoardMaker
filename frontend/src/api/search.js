import api from './axios';

export const searchApi = {
  search: (query) => api.get('/search', { params: { q: query } }),
};
