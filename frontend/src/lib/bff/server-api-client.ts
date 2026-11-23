import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { cookies, headers } from "next/headers";
import crypto from "crypto";

import { serverClient } from "../axios/axio-server";
import type { ApiErrorResponse, ApiResponse } from "@/src/types/api/api.types";
import { ApiError } from "@/src/types/api/api.types";
import { accessTokenStore } from "@/src/server/modules/auth/session";

declare module "axios" {
  export interface AxiosInstance {
    __bffInterceptorsRegistered?: boolean;
  }
}

/**
 * Kiểm tra xem endpoint có thuộc danh sách public (không yêu cầu Bearer token) hay không
 */
function isPublicPath(url?: string): boolean {
  if (!url) return false;
  const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, "");
  const pathname = cleanUrl.split("?")[0] || "";
  const publicPaths = [
    "/auth/login",
    "/auth/register",
    "/auth/verify-email",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/resend-verification-email",
    "/auth/refresh-token",
  ];
  return publicPaths.some((p) => pathname.startsWith(p));
}

// Đăng ký Request & Response Interceptors cho serverClient (chỉ đăng ký 1 lần)
if (!serverClient.__bffInterceptorsRegistered) {
  serverClient.__bffInterceptorsRegistered = true;

  // 1. Request Interceptor: Tự động đính kèm Device ID, Bearer Token, CSRF Token & Cookie
  serverClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      let cookieStore: Awaited<ReturnType<typeof cookies>> | undefined;
      let headerStore: Awaited<ReturnType<typeof headers>> | undefined;

      try {
        cookieStore = await cookies();
        headerStore = await headers();
      } catch {
        // Có thể chạy ngoài ngữ cảnh request của Next.js (ví dụ build time / background)
      }

      // 1. Tìm deviceId từ config.headers, headerStore hoặc cookieStore
      const existingHeaders =
        (config.headers as unknown as Record<string, string | undefined>) ?? {};

      const deviceId =
        (typeof config.headers?.get === "function"
          ? (config.headers.get("x-device-id") as string | undefined) ||
            (config.headers.get("device-id") as string | undefined)
          : undefined) ||
        existingHeaders["x-device-id"] ||
        existingHeaders["device-id"] ||
        headerStore?.get("x-device-id") ||
        headerStore?.get("device-id") ||
        headerStore?.get("deviceId") ||
        cookieStore?.get("device_id")?.value ||
        cookieStore?.get("x-device-id")?.value ||
        cookieStore?.get("deviceId")?.value;

      if (deviceId) {
        config.headers.set("x-device-id", deviceId);
      }

      // 2. Lấy Access Token từ Redis dựa trên deviceId nếu chưa có Authorization
      const hasAuth =
        typeof config.headers?.get === "function"
          ? config.headers.get("Authorization") || config.headers.get("authorization")
          : existingHeaders["Authorization"] || existingHeaders["authorization"];

      if (!hasAuth && deviceId) {
        const session = await accessTokenStore.get(deviceId);
        if (
          session?.expiresAt &&
          session.expiresAt > 0 &&
          session.expiresAt <= Date.now()
        ) {
          await accessTokenStore.remove(deviceId).catch(() => {});
          throw new ApiError({
            statusCode: 401,
            message: "Access token expired in Redis",
            timestamp: new Date().toISOString(),
            type: "AUTHENTICATION_ERROR",
            path: "server-api-client",
          });
        }

        if (session?.accessToken) {
          config.headers.set("Authorization", `Bearer ${session.accessToken}`);
        }
      }

      // Nếu endpoint yêu cầu bảo vệ mà không có Bearer token trong Redis
      const isAuthRequired = !isPublicPath(config.url);
      const finalAuth =
        typeof config.headers?.get === "function"
          ? config.headers.get("Authorization") || config.headers.get("authorization")
          : existingHeaders["Authorization"] || existingHeaders["authorization"];

      if (isAuthRequired && !finalAuth) {
        throw new ApiError({
          statusCode: 401,
          message: "Authorization session is missing in Redis for device",
          timestamp: new Date().toISOString(),
          type: "AUTHENTICATION_ERROR",
          path: "server-api-client",
        });
      }

      // 3. Tự động đọc CSRF Token từ request của Client (headers hoặc cookies)
      const method = (config.method ?? "get").toUpperCase();
      const mutationMethods = ["POST", "PUT", "PATCH", "DELETE"];
      const isMutation = mutationMethods.includes(method);

      let csrfToken =
        (typeof config.headers?.get === "function"
          ? (config.headers.get("x-xsrf-token") as string | undefined) ||
            (config.headers.get("x-csrf-token") as string | undefined) ||
            (config.headers.get("csrf-token") as string | undefined)
          : undefined) ||
        existingHeaders["x-xsrf-token"] ||
        existingHeaders["x-csrf-token"] ||
        existingHeaders["csrf-token"] ||
        headerStore?.get("x-xsrf-token") ||
        headerStore?.get("x-csrf-token") ||
        headerStore?.get("csrf-token") ||
        cookieStore?.get("XSRF-TOKEN")?.value ||
        cookieStore?.get("xsrf-token")?.value;

      // 4. Nếu là mutation method, tự động gắn header 'x-xsrf-token'
      if (isMutation) {
        if (!csrfToken) {
          console.warn(
            `[ServerApiClient] Warning: CSRF token (XSRF-TOKEN) not found in client request for ${method} ${config.url}. Generating fallback token to prevent 403.`,
          );
          csrfToken =
            crypto.randomUUID().replace(/-/g, "") +
            crypto.randomUUID().replace(/-/g, "");
        }

        config.headers.set("x-xsrf-token", csrfToken);
      }

      // 5. Chuyển tiếp toàn bộ Cookie từ Client sang Backend (bao gồm cả XSRF-TOKEN & refresh_token)
      const cookieMap = new Map<string, string>();
      if (cookieStore) {
        const allCookies = cookieStore.getAll();
        for (const c of allCookies) {
          cookieMap.set(c.name, c.value);
        }
      }

      // Luôn đảm bảo XSRF-TOKEN có trong Cookie gửi sang Backend để khớp với header x-xsrf-token
      if (csrfToken) {
        cookieMap.set("XSRF-TOKEN", csrfToken);
      }
      if (deviceId && !cookieMap.has("device_id")) {
        cookieMap.set("device_id", deviceId);
      }

      const existingCookie =
        typeof config.headers?.get === "function"
          ? (config.headers.get("Cookie") as string | undefined)
          : existingHeaders["Cookie"] || existingHeaders["cookie"];

      if (existingCookie) {
        existingCookie.split(";").forEach((pair) => {
          const [k, v] = pair.trim().split("=");
          if (k && v) cookieMap.set(k, v);
        });
      }

      if (cookieMap.size > 0) {
        const cookieHeader = Array.from(cookieMap.entries())
          .map(([name, value]) => `${name}=${value}`)
          .join("; ");
        config.headers.set("Cookie", cookieHeader);
      }

      config.withCredentials = true;

      return config;
    },
  );

  // 2. Response Interceptor: Chuẩn hóa ApiError nếu Backend trả lỗi
  serverClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data as ApiErrorResponse | undefined;
        if (response) {
          return Promise.reject(new ApiError(response));
        }
      }
      return Promise.reject(error);
    },
  );
}

class ServerApiClient {
  private async handleError(error: unknown): Promise<never> {
    if (error instanceof ApiError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const response = error.response?.data as ApiErrorResponse | undefined;
      if (response) {
        throw new ApiError(response);
      }
    }

    throw error;
  }

  /**
   * Tự động tiền xử lý config cho request mutation để đảm bảo CSRF token luôn sẵn sàng
   */
  private async enrichConfig<D>(
    method: string,
    customConfig?: AxiosRequestConfig<D>,
  ): Promise<AxiosRequestConfig<D>> {
    const config: AxiosRequestConfig<D> = {
      ...(customConfig ?? {}),
      headers: {
        ...(customConfig?.headers ?? {}),
      },
    };

    const upperMethod = method.toUpperCase();
    const mutationMethods = ["POST", "PUT", "PATCH", "DELETE"];

    if (mutationMethods.includes(upperMethod)) {
      try {
        const cookieStore = await cookies();
        const headerStore = await headers();

        const headersObj = config.headers as Record<string, string>;
        const csrfToken =
          headersObj["x-xsrf-token"] ||
          headersObj["x-csrf-token"] ||
          headersObj["csrf-token"] ||
          headerStore.get("x-xsrf-token") ||
          headerStore.get("x-csrf-token") ||
          headerStore.get("csrf-token") ||
          cookieStore.get("XSRF-TOKEN")?.value ||
          cookieStore.get("xsrf-token")?.value;

        if (csrfToken) {
          headersObj["x-xsrf-token"] = csrfToken;
        }
      } catch {
        // Ngoài context request Next.js
      }
    }

    return config;
  }

  async get<T, P = Record<string, unknown>>(
    url: string,
    paramsOrConfig?: P | AxiosRequestConfig,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      // Hỗ trợ cả 2 cách gọi: serverApiClient.get(url, { params: { ... } }) hoặc serverApiClient.get(url, { ...params })
      const hasParamsKey =
        paramsOrConfig &&
        typeof paramsOrConfig === "object" &&
        "params" in paramsOrConfig;

      let finalParams = hasParamsKey
        ? (paramsOrConfig as Record<string, unknown>).params
        : paramsOrConfig;

      // Đảm bảo không bị lồng params[params]
      while (
        finalParams &&
        typeof finalParams === "object" &&
        "params" in finalParams &&
        typeof (finalParams as Record<string, unknown>).params === "object"
      ) {
        finalParams = (finalParams as Record<string, unknown>).params;
      }

      const baseConfig = hasParamsKey
        ? (paramsOrConfig as AxiosRequestConfig)
        : config;

      return await serverClient.get<ApiResponse<T>>(url, {
        ...(baseConfig ?? {}),
        ...(finalParams ? { params: finalParams } : {}),
      });
    } catch (error) {
      return await this.handleError(error);
    }
  }

  async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      const finalConfig = await this.enrichConfig<D>("POST", config);
      return await serverClient.post<ApiResponse<T>>(url, data, finalConfig);
    } catch (error) {
      return await this.handleError(error);
    }
  }

  async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      const finalConfig = await this.enrichConfig<D>("PUT", config);
      return await serverClient.put<ApiResponse<T>>(url, data, finalConfig);
    } catch (error) {
      return await this.handleError(error);
    }
  }

  async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      const finalConfig = await this.enrichConfig<D>("PATCH", config);
      return await serverClient.patch<ApiResponse<T>>(url, data, finalConfig);
    } catch (error) {
      return await this.handleError(error);
    }
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      const finalConfig = await this.enrichConfig("DELETE", config);
      return await serverClient.delete<ApiResponse<T>>(url, finalConfig);
    } catch (error) {
      return await this.handleError(error);
    }
  }

  /**
   * Auth APIs:
   * login / refresh / logout
   *
   * Không tự retry.
   */
  async postWithoutRetry<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      const finalConfig = await this.enrichConfig<D>("POST", config);
      return await serverClient.post<ApiResponse<T>>(url, data, finalConfig);
    } catch (error) {
      return await this.handleError(error);
    }
  }
}

export const serverApiClient = new ServerApiClient();
