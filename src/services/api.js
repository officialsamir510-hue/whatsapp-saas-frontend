// src/services/api.js

import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Request interceptor - Token add karo
api.interceptors.request.use(
    (config) => {
        // ✅ FIXED: Use AUTH_TOKEN (same as authStore)
        const token = localStorage.getItem('AUTH_TOKEN');
        console.log('🔑 API Request - Token exists:', !!token);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Authorization header added');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('❌ API Error:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 401) {
            console.log('🚪 401 Unauthorized - Clearing token');
            localStorage.removeItem('AUTH_TOKEN');  // ✅ FIXED: Use AUTH_TOKEN
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;