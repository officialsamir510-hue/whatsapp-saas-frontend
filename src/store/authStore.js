import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
    user: null,
    tenant: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // ==================== REGISTER ====================
    register: async (name, email, password, company) => {
        try {
            set({ isLoading: true, error: null });

            console.log('📝 Registering:', email);

            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                company
            });

            console.log('✅ Registration response:', response.data);

            if (response.data?.success && response.data?.data?.token) {
                const { token, user, tenant } = response.data.data;

                // Save token
                localStorage.setItem('AUTH_TOKEN', token);

                // Update state
                set({
                    user,
                    tenant,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });

                console.log('✅ Registration successful');

                return {
                    success: true,
                    message: 'Registration successful'
                };
            }

            throw new Error(response.data?.message || 'Registration failed');

        } catch (error) {
            console.error('❌ Registration error:', error);

            const errorMessage = error.response?.data?.message || error.message;

            set({
                isLoading: false,
                error: errorMessage
            });

            return {
                success: false,
                message: errorMessage
            };
        }
    },

    // ==================== LOGIN ====================
    login: async (email, password) => {
        try {
            set({ isLoading: true, error: null });

            console.log('🔐 Logging in:', email);

            const response = await api.post('/auth/login', {
                email,
                password
            });

            console.log('✅ Login response:', response.data);

            if (response.data?.success && response.data?.data?.token) {
                const { token, user, tenant } = response.data.data;

                // Save token
                localStorage.setItem('AUTH_TOKEN', token);

                // Update state
                set({
                    user,
                    tenant,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });

                console.log('✅ Login successful');

                return {
                    success: true,
                    message: 'Login successful'
                };
            }

            throw new Error(response.data?.message || 'Login failed');

        } catch (error) {
            console.error('❌ Login error:', error);

            const errorMessage = error.response?.data?.message || error.message;

            set({
                isLoading: false,
                error: errorMessage
            });

            return {
                success: false,
                message: errorMessage
            };
        }
    },

    // ==================== LOAD USER ====================
    loadUser: async () => {
        const token = localStorage.getItem('AUTH_TOKEN');

        if (!token) {
            console.log('⚠️ No token found');
            set({
                user: null,
                tenant: null,
                isAuthenticated: false,
                isLoading: false
            });
            return false;
        }

        try {
            set({ isLoading: true });

            console.log('📡 Loading user from /auth/me...');

            const response = await api.get('/auth/me');

            console.log('✅ User loaded:', response.data);

            if (response.data?.success && response.data?.data?.user) {
                const { user, tenant } = response.data.data;

                set({
                    user,
                    tenant,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });

                return true;
            }

            throw new Error('Invalid response');

        } catch (error) {
            console.error('❌ LoadUser error:', error);

            // Clear invalid auth
            localStorage.removeItem('AUTH_TOKEN');

            set({
                user: null,
                tenant: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });

            return false;
        }
    },

    // ==================== LOGOUT ====================
    logout: async () => {
        try {
            console.log('🚪 Logging out...');

            // Call logout endpoint (optional)
            await api.post('/auth/logout').catch(() => {});

            // Clear token
            localStorage.removeItem('AUTH_TOKEN');

            // Clear state
            set({
                user: null,
                tenant: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });

            console.log('✅ Logged out');

        } catch (error) {
            console.error('❌ Logout error:', error);

            // Clear anyway
            localStorage.removeItem('AUTH_TOKEN');

            set({
                user: null,
                tenant: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });
        }
    },

    // ==================== CLEAR ERROR ====================
    clearError: () => {
        set({ error: null });
    }
}));