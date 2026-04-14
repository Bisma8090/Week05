import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/cars', '/users', '/payments', '/wishlist', '/bids'];
const isProtectedRequest = (url?: string) =>
  PROTECTED_ROUTES.some((route) => url?.includes(route));

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthRoute = window.location.pathname.startsWith('/auth');
      if (!isAuthRoute && isProtectedRequest(err.config?.url)) {
        // Only redirect if token exists but is invalid/expired (not missing)
        const token = localStorage.getItem('token');
        if (token) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(err);
  },
);

export default api;
