import axios from "axios";

export const axiosClient = axios.create({
  baseURL: "/api",

  timeout: 10000,

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

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
