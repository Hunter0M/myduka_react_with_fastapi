import axios from 'axios';
import { authService } from './authService';

// Create axios instance with base configuration

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('access_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

// Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Handle 401 errors (unauthorized)
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const refreshToken = localStorage.getItem('refresh_token');
//         const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
//         const { access_token } = response.data;
        
//         localStorage.setItem('access_token', access_token);
//         originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
//         return api(originalRequest);
//       } catch (refreshError) {
//         // If refresh fails, logout
//         localStorage.clear();
//         window.dispatchEvent(new Event('auth-error'));
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default api; 