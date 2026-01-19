import { create } from 'zustand';
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
            const { token, user, tenant } = res.data.data;
            
            console.log('✅ Login successful');
            console.log('🔥 Is Super Admin:', user?.isSuperAdmin);
            
            // Save token
            localStorage.setItem('AUTH_TOKEN', token);
            console.log('💾 Token saved');
            
            // Update state
            set({
                user: {
                    ...user,
                    isSuperAdmin: user.isSuperAdmin || false
                },
                tenant,
                isAuthenticated: true,
                isLoading: false
            });
            
            return { success: true };
        } catch (error) {
            console.error('❌ Login error:', error);
            set({ isLoading: false });
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    },
    
    logout: () => {
        console.log('🚪 Logging out...');
        localStorage.removeItem('AUTH_TOKEN');
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
        
        // No token - not authenticated
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
            
            // Check if response is valid
            if (!res.data.success || !res.data.data) {
                throw new Error('Invalid response');
            }
            
            const { user, tenant } = res.data.data;
            
            console.log('✅ User loaded:', user?.email);
            console.log('🔥 Is Super Admin:', user?.isSuperAdmin);
            
            set({
                user: {
                    ...user,
                    isSuperAdmin: user.isSuperAdmin || false
                },
                tenant,
                isAuthenticated: true,
                isLoading: false
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ LoadUser failed:', error);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error data:', error.response?.data);
            
            // Token invalid - remove it
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('🗑️ Removing invalid token');
                localStorage.removeItem('AUTH_TOKEN');
            }
            
            set({
                user: null,
                tenant: null,
                isAuthenticated: false,
                isLoading: false
            });
            
            return false;
        }
    },

    updateUser: (userData) => {
        set((state) => ({
            user: { ...state.user, ...userData }
        }));
    },

    updateTenant: (tenantData) => {
        set((state) => ({
            tenant: { ...state.tenant, ...tenantData }
        }));
    }
}));