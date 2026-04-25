import axios from 'axios';

const getStoredToken = () =>
  localStorage.getItem('token') || sessionStorage.getItem('token');

// Create consistent axios instance
const api = axios.create({
  baseURL: '/api', // Using Vite proxy
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData =
      typeof FormData !== 'undefined' && config.data instanceof FormData;

    if (isFormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response.data, // Extract data wrapper
  (error) => {
    // If we get an unauthorized error, we might want to log out the user
    // However, handling it in AuthContext is often cleaner.
    // For now, just format the error consistently.
    const customError = {
      message: error.response?.data?.message || 'Something went wrong',
      success: false,
      status: error.response?.status,
      errors: error.response?.data?.errors || [],
    };
    return Promise.reject(customError);
  }
);

export default api;
