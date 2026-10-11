import axios from 'axios';

// Ready for FastAPI / Node backend endpoint base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.snapfit.ai/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT auth tokens if stored
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('snapfit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
