import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<void> | null = null;

axiosClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let deviceId = localStorage.getItem("x-device-id");

    if (!deviceId) {
      deviceId = crypto.randomUUID();

      localStorage.setItem("x-device-id", deviceId);
    }

    config.headers["x-device-id"] = deviceId;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

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
    }

    return Promise.reject(error);
  },
);

export { axiosClient };
