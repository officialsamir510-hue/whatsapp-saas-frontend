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

                localStorage.setItem('AUTH_TOKEN', token);

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

                localStorage.setItem('AUTH_TOKEN', token);

                set({
                    user,
                    tenant,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });

                console.log('✅ Login successful - isAuthenticated set to true');

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

        console.log('🔍 loadUser called');
        console.log('🔑 Token exists:', !!token);

        if (!token) {
            console.log('⚠️ No token - setting isAuthenticated to false');
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

            console.log('📡 Calling /auth/me...');

            const response = await api.get('/auth/me');

            console.log('✅ /auth/me response:', response.data);

            if (response.data?.success && response.data?.data?.user) {
                const { user, tenant } = response.data.data;

                set({
                    user,
                    tenant,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });

                console.log('✅ User loaded - isAuthenticated set to true');

                return true;
            }

            console.log('⚠️ Invalid response from /auth/me');
            throw new Error('Invalid response');

        } catch (error) {
            console.error('❌ LoadUser error:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);

            // ✅ CRITICAL: Don't clear token immediately
            // Let user stay logged in if token is still valid locally
            
            // Only clear if it's a real auth error (401)
            if (error.response?.status === 401) {
                console.log('🚪 401 error - clearing token');
                localStorage.removeItem('AUTH_TOKEN');
                
                set({
                    user: null,
                    tenant: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null
                });
            } else {
                // Network error or server error - keep user logged in
                console.log('⚠️ Non-auth error - keeping user logged in');
                set({
                    isLoading: false
                    // Don't change isAuthenticated
                });
            }

            return false;
        }
    },

    // ==================== LOGOUT ====================
    logout: async () => {
        try {
            console.log('🚪 Logging out...');

            await api.post('/auth/logout').catch(() => {});

            localStorage.removeItem('AUTH_TOKEN');

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

    clearError: () => {
        set({ error: null });
    }
}));