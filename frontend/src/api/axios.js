import axios from 'axios';

let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (!rawUrl.endsWith('/api')) rawUrl += '/api';
const BASE_URL = rawUrl;

// Public routes that must NEVER send an Authorization header
const PUBLIC_PATHS = ['/auth/login', '/auth/register'];

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT — but skip for public auth routes
api.interceptors.request.use((config) => {
  const isPublic = PUBLIC_PATHS.some((path) => config.url?.includes(path));
  if (!isPublic) {
    const token = localStorage.getItem('mb_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — but only redirect when NOT on a login/register call
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicRoute = PUBLIC_PATHS.some((path) =>
      error.config?.url?.includes(path)
    );
    if (error.response?.status === 401 && !isPublicRoute) {
      // Stale/expired token — clear session and send to login
      localStorage.removeItem('mb_token');
      localStorage.removeItem('mb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
