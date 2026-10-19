"use client";

import axios from "axios";
import { CookieManager } from "@/utils/cookie-utils";

// ✅ Use correct env variable with local dev fallback
export const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/* ================= REQUEST INTERCEPTOR ================= */
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = CookieManager.get("blockvextrade-admin-token") || CookieManager.get("satrixnow-admin-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      // Clear all auth-related cookies
      CookieManager.remove("blockvextrade-admin-token");
      CookieManager.remove("satrixnow-admin-token");
      CookieManager.remove("isAuthenticated");
      
      // Redirect to login
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
