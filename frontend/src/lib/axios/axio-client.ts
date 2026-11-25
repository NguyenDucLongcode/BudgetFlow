import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { queryClient } from "../react-query/query-client";
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
let isRecovering = false;

/**
 * Xử lý bằng vũ lực khi phiên đăng nhập hỏng / refresh thất bại / logout lỗi.
 * Ép tải lại trang hoàn toàn (hard reload) về /login, xóa sạch React Query & localStorage state.
 * Tuyệt đối không cố gắng gọi API logout hay bất kỳ API nào khác để tránh kẹt vòng lặp vô hạn.
 */
function forceHardRedirectToLogin() {
  if (typeof window === "undefined" || isRecovering) return;
  isRecovering = true;

  try {
    localStorage.removeItem("x-device-id");
    queryClient.clear();
    document.cookie = "device_id=; path=/; max-age=0";
    document.cookie = "refresh_token=; path=/; max-age=0";
    document.cookie = "XSRF-TOKEN=; path=/; max-age=0";
  } catch (err) {
    console.error("[AxiosClient] Error clearing client auth state:", err);
  }

  // Chuyển hướng kèm cờ error để Proxy Guard cho phép render trang login và không redirect ngược vào /admin
  window.location.href = "/login?error=session_expired";
}

async function recoverFromAuthenticationFailure() {
  forceHardRedirectToLogin();
}

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
    const status = error.response?.status;

    // 1. Nếu API logout gặp lỗi (404, 500, etc.) -> Dùng vũ lực hard reload về /login, KHÔNG gọi lại logout
    if (
      requestUrl.includes("/auth/logout") ||
      requestUrl.includes("/auth/logout-all")
    ) {
      console.warn(
        `[AxiosClient] Logout request (${requestUrl}) failed with status ${status}. Forcing hard redirect to /login.`,
      );
      forceHardRedirectToLogin();
      return Promise.reject(error);
    }

    // 2. Nếu API refresh token gặp lỗi (401, 400, 429, 500, etc.) -> Dùng vũ lực hard reload về /login
    if (requestUrl.includes("/auth/refresh")) {
      console.warn(
        `[AxiosClient] Refresh token request failed with status ${status}. Forcing hard redirect to /login.`,
      );
      forceHardRedirectToLogin();
      return Promise.reject(error);
    }

    // 3. Bỏ qua các API Auth khác (login, register, forgot-password...)
    const isOtherAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/verify-email") ||
      requestUrl.includes("/auth/forgot-password") ||
      requestUrl.includes("/auth/reset-password");

    if (isOtherAuthRequest) {
      return Promise.reject(error);
    }

    // 4. Khi gặp lỗi 401 trên request thông thường (như /users/me, API dữ liệu...)
    if (status === 401) {
      if (originalRequest._retry) {
        // Đã retry 1 lần mà vẫn 401 -> Session hết hạn / không hợp lệ -> Force redirect về login ngay, ngắt vòng lặp
        console.warn(
          `[AxiosClient] Request ${requestUrl} failed with 401 after retry. Forcing redirect to /login.`,
        );
        forceHardRedirectToLogin();
        return Promise.reject(error);
      }

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
        console.error(
          "[AxiosClient] Refresh token failed during retry:",
          refreshError,
        );
        forceHardRedirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    // 5. Nếu dính 429 Too Many Requests trên API cốt lõi -> Cắt đứt vòng lặp ngay lập tức
    if (
      status === 429 &&
      (requestUrl.includes("/users/me") || requestUrl.includes("/auth/refresh"))
    ) {
      console.error(
        "[AxiosClient] 429 Too Many Requests detected on critical endpoint. Forcing redirect to /login to stop loop.",
      );
      toast.error(
        "Quá nhiều yêu cầu, vui lòng thử lại sau vài giây.",
        { toastId: "rate-limit-429", autoClose: 5000 },
      );
      // Delay nhẹ để toast hiện trước khi redirect
      setTimeout(() => forceHardRedirectToLogin(), 2000);
    }

    return Promise.reject(error);
  },
);

export {
  axiosClient,
  recoverFromAuthenticationFailure,
  forceHardRedirectToLogin,
};
