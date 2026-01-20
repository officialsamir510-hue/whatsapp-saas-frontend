import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

console.log('🌐 API Base URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
    timeout: 30000
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
        console.log(`✅ ${response.config.url} - ${response.status}`);
        return response;
    },
    (error) => {
        const originalRequest = error.config;

        console.error('❌ Response error:', {
            url: originalRequest?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });

        // ✅ CRITICAL FIX: Don't auto-redirect here
        // Let individual functions handle errors
        
        // Only log, don't redirect
        if (error.response?.status === 401) {
            console.log('⚠️ 401 Unauthorized detected');
            // Don't remove token here - let loadUser handle it
        }

        return Promise.reject(error);
    }
);

export default api;