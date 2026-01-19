// src/store/authStore.js

import { create } from 'zustand';  // ✅ Fixed import
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
    user: null,
    tenant: null,
    isAuthenticated: false,
    isLoading: true,
    
    login: async (email, password) => {
        try {
            console.log('🔐 Attempting login:', email);
            
            const res = await api.post('/auth/login', { email, password });
            
            console.log('Login response:', res.data);
            
            if (!res.data.success || !res.data.data) {
                throw new Error('Invalid response structure');
            }
            
            const { token, user, tenant } = res.data.data;
            
            if (!token) {
                throw new Error('No token received');
            }
            
            console.log('✅ Login successful');
            
            // Save token with CORRECT name
            localStorage.setItem('AUTH_TOKEN', token);
            console.log('💾 Token saved as AUTH_TOKEN');
            
            // Update state
            set({
                user: user,
                tenant: tenant,
                isAuthenticated: true,
                isLoading: false
            });
            
            return { success: true };
        } catch (error) {
            console.error('❌ Login error:', error);
            set({ isLoading: false });
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Login failed' 
            };
        }
    },
    
    logout: () => {
        console.log('🚪 Logging out...');
        localStorage.removeItem('AUTH_TOKEN');
        localStorage.removeItem('token');  // Remove both just in case
        set({
            user: null,
            tenant: null,
            isAuthenticated: false,
            isLoading: false
        });
    },
    
    loadUser: async () => {
        const token = localStorage.getItem('AUTH_TOKEN');
        
        console.log('🔍 LoadUser called');
        console.log('🔑 Token exists:', !!token);
        
        if (!token) {
            console.log('⚠️ No token found');
            set({ 
                isAuthenticated: false,
                user: null,
                tenant: null,
                isLoading: false
            });
            return false;
        }
        
        try {
            console.log('📡 Fetching /auth/me...');
            const res = await api.get('/auth/me');
            
            console.log('✅ /auth/me response:', res.data);
            
            if (!res.data.success) {
                throw new Error('Failed to load user');
            }
            
            const { user, tenant } = res.data.data;
            
            set({
                user: user,
                tenant: tenant,
                isAuthenticated: true,
                isLoading: false
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ LoadUser failed:', error);
            
            // Clear invalid token
            localStorage.removeItem('AUTH_TOKEN');
            
            set({
                user: null,
                tenant: null,
                isAuthenticated: false,
                isLoading: false
            });
            
            return false;
        }
    }
}));