import { create } from "zustand";
import api from "../services/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("AUTH_TOKEN"),

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    // 🔴 YAHI SABSE IMPORTANT HAI
    if (res.data?.token) {
      localStorage.setItem("AUTH_TOKEN", res.data.token);
      localStorage.setItem("USER", JSON.stringify(res.data.user));

      set({
        user: res.data.user,
        token: res.data.token,
      });
    }

    return res.data;
  },

  logout: () => {
    localStorage.removeItem("AUTH_TOKEN");
    localStorage.removeItem("USER");
    set({ user: null, token: null });
  },
}));