import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { queryClient } from "../react-query/query-client";
import { authService, clearAuthState } from "@/src/client/auth";
import { getCookie } from "../utils/cookie";

const axiosClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: gắn x-device-id và x-xsrf-token
axiosClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let deviceId = localStorage.getItem("x-device-id");

    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("x-device-id", deviceId);
    }

    config.headers["x-device-id"] = deviceId;

    if (typeof document !== "undefined") {
      document.cookie = `device_id=${deviceId}; path=/; SameSite=Lax`;
    }

    // Gắn CSRF token cho các thao tác mutation
    const method = (config.method ?? "get").toLowerCase();
    const mutationMethods = ["post", "put", "patch", "delete"];
    if (mutationMethods.includes(method)) {
      const csrfToken = getCookie("XSRF-TOKEN");
      if (csrfToken) {
        config.headers["x-xsrf-token"] = csrfToken;
      }
    }
  }

  return config;
});

let refreshPromise: Promise<void> | null = null;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean;
    }) | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? "";

    // Bỏ qua các API Auth: không auto-refresh khi chính các endpoint này lỗi 401
    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout") ||
      requestUrl.includes("/auth/logout-all") ||
      requestUrl.includes("/auth/verify-email") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/reset-password");

    if (isAuthRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axiosClient
            .post("/auth/refresh")
            .then(() => {
              console.log("[AxiosClient] Refresh token success");
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        await refreshPromise;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error("[AxiosClient] Refresh token failed, logging out:", refreshError);

        try {
          await authService.logout();
        } catch (logoutError) {
          console.error("[AxiosClient] Logout call failed:", logoutError);
        }

        clearAuthState(queryClient);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export { axiosClient };
