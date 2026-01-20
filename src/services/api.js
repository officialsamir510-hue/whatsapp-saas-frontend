import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

console.log('🌐 API Base URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
    timeout: 30000 // 30 seconds
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('AUTH_TOKEN');

        console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
        console.log('🔑 Token exists:', !!token);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log(`✅ Response: ${response.config.url} - ${response.status}`);
        return response;
    },
    (error) => {
        const originalRequest = error.config;

        console.error('❌ Response error:', {
            url: originalRequest?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });

        // Don't redirect for auth endpoints
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
                               originalRequest?.url?.includes('/auth/register');

        if (error.response?.status === 401 && !isAuthEndpoint) {
            console.log('🚪 401 Unauthorized - Logging out...');

            localStorage.removeItem('AUTH_TOKEN');

            // Prevent redirect loop
            if (!window.location.pathname.includes('/login')) {
                setTimeout(() => {
                    window.location.href = '/login';
                }, 100);
            }
        }

        return Promise.reject(error);
    }
);

export default api;