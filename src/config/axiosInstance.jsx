"use client";

import axios from "axios";

// ✅ Use correct env variable
export const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ✅ REQUIRED for cookies
});

/* ================= RESPONSE INTERCEPTOR ================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      document.cookie = "isAuthenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
// "use client";

// import axios from "axios";
// import { CookieManager } from "@/utils/cookie-utils";

// export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// const axiosInstance = axios.create({
//   baseURL: API_URL,
//   withCredentials: false,
// });

// // Attach token if available
// if (typeof window !== "undefined") {
//   const token = CookieManager.get("sec-prd-token");
//   if (token) axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
// }

// // Global response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error?.response?.status === 401 && typeof window !== "undefined") {
//       CookieManager.remove("sec-prd-token");
//       delete axiosInstance.defaults.headers.common.Authorization;
//       // Optional: redirect to login
//       // window.location.href = "/auth";
//     }
//     return Promise.reject(error);
//   }
// );

// // Helper functions
// export const setAuthToken = (token) => {
//   CookieManager.set("sec-prd-token", token, {
//     expires: 7,
//     path: "/",
//     secure: true,
//     sameSite: "Strict",
//   });
//   axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
// };

// export const clearAuthToken = () => {
//   CookieManager.remove("sec-prd-token");
//   delete axiosInstance.defaults.headers.common.Authorization;
// };

// export const getAuthToken = () => {
//   return CookieManager.get("sec-prd-token");
// };

// export default axiosInstance;
