import { create } from "zustand";
import api from "../services/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  tenant: null,
  isAuthenticated: false,
  isLoading: false,

  // ==================== REGISTER ====================
  register: async (name, email, password, company) => {
    try {
      set({ isLoading: true });
      console.log('📝 Registering user:', email);

      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        company
      });

      console.log('✅ Register response:', res.data);

      // ✅ CORRECT: Backend sends data.token
      if (res.data?.success && res.data?.data?.token) {
        const { token, user, tenant } = res.data.data;

        localStorage.setItem("AUTH_TOKEN", token);
        
        set({
          user: user,
          tenant: tenant,
          isAuthenticated: true,
          isLoading: false
        });

        console.log('✅ Registration successful');
        return { success: true };
      }

      set({ isLoading: false });
      return { 
        success: false, 
        message: res.data?.message || 'Registration failed' 
      };

    } catch (error) {
      console.error('❌ Registration error:', error);
      set({ isLoading: false });
      
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  // ==================== LOGIN ====================
  login: async (email, password) => {
    try {
      set({ isLoading: true });
      console.log('🔐 Logging in:', email);

      const res = await api.post("/auth/login", { email, password });

      console.log('✅ Login response:', res.data);

      // ✅ CORRECT: Backend sends data.token
      if (res.data?.success && res.data?.data?.token) {
        const { token, user, tenant } = res.data.data;

        localStorage.setItem("AUTH_TOKEN", token);

        set({
          user: user,
          tenant: tenant,
          isAuthenticated: true,
          isLoading: false
        });

        console.log('✅ Login successful');
        return { success: true };
      }

      set({ isLoading: false });
      return {
        success: false,
        message: res.data?.message || 'Login failed'
      };

    } catch (error) {
      console.error('❌ Login error:', error);
      set({ isLoading: false });

      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  // ==================== LOAD USER ====================
  loadUser: async () => {
    const token = localStorage.getItem("AUTH_TOKEN");

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
      set({ isLoading: true });
      console.log('📡 Loading user from /auth/me...');

      const res = await api.get("/auth/me");

      console.log('✅ /auth/me response:', res.data);

      if (res.data?.success && res.data?.data?.user) {
        const { user, tenant } = res.data.data;

        set({
          user: user,
          tenant: tenant,
          isAuthenticated: true,
          isLoading: false
        });

        return true;
      }

      // Invalid response
      localStorage.removeItem("AUTH_TOKEN");
      set({
        user: null,
        tenant: null,
        isAuthenticated: false,
        isLoading: false
      });
      return false;

    } catch (error) {
      console.error('❌ LoadUser error:', error);
      
      // Clear auth on error
      localStorage.removeItem("AUTH_TOKEN");
      set({
        user: null,
        tenant: null,
        isAuthenticated: false,
        isLoading: false
      });
      return false;
    }
  },

  // ==================== LOGOUT ====================
  logout: () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem("AUTH_TOKEN");
    set({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false
    });
  }
}));