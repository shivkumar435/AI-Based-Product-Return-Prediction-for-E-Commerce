import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';
rawBaseUrl = typeof rawBaseUrl === 'string' ? rawBaseUrl.trim().replace(/\/+$/, '') : '/api';

// If a remote URL is provided (e.g., https://xyz.onrender.com) without the '/api' suffix,
// automatically append '/api' because the backend routes are mounted under /api/*
if (/^https?:\/\//i.test(rawBaseUrl) && !/\/api$/i.test(rawBaseUrl)) {
  rawBaseUrl = `${rawBaseUrl}/api`;
}

const api = axios.create({
  baseURL: rawBaseUrl
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Auto-logout on 401 Unauthorized
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
