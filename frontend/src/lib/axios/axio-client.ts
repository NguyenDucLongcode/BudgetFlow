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
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const requestUrl = originalRequest.url ?? "";
    const isAuthRefreshRequest = requestUrl.includes("/auth/refresh");
    const isAuthLogoutRequest = requestUrl.includes("/auth/logout");
    const isAuthLogoutAllRequest = requestUrl.includes("/auth/logout-all");

    if (isAuthRefreshRequest || isAuthLogoutRequest || isAuthLogoutAllRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axiosClient
            .post("/auth/refresh")
            .then(() => {
              console.log("Refresh token success");
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        await refreshPromise;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // 1. Gọi logout (có try-catch)
        try {
          console.log("Refresh token failed, logging out...");
          await authService.logout();
        } catch (logoutError) {
          // Log lỗi nhưng vẫn tiếp tục xóa localStorage và redirect
          console.error("Logout failed:", logoutError);
        }

        // 2. Xóa device id (LUÔN thực hiện)
        clearAuthState(queryClient);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export { axiosClient };
