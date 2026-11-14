import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { cookies, headers } from "next/headers";

import { serverClient } from "../axios/axio-server";
import type { ApiErrorResponse, ApiResponse } from "@/src/types/api/api.types";
import { ApiError } from "@/src/types/api/api.types";
import { accessTokenStore } from "@/src/server/modules/auth/session";

class ServerApiClient {
  private async createClient(config?: AxiosRequestConfig) {
    const cookieStore = await cookies();
    const headerStore = await headers();

    // 1. Tìm deviceId từ header hoặc cookie
    const deviceId =
      headerStore.get("x-device-id") ||
      headerStore.get("device-id") ||
      headerStore.get("deviceId") ||
      cookieStore.get("device_id")?.value ||
      cookieStore.get("x-device-id")?.value ||
      cookieStore.get("deviceId")?.value;

    let accessToken: string | null = null;
    if (deviceId) {
      const session = await accessTokenStore.get(deviceId);
      accessToken = session?.accessToken ?? null;
    }

    // 2. Lấy CSRF token từ config.headers, headerStore hoặc cookieStore
    const customHeaders = (config?.headers as Record<string, string | undefined>) ?? {};
    const customCsrf =
      customHeaders["x-xsrf-token"] ||
      customHeaders["x-csrf-token"] ||
      customHeaders["csrf-token"];

    const csrfHeader =
      customCsrf ||
      headerStore.get("x-xsrf-token") ||
      headerStore.get("x-csrf-token") ||
      headerStore.get("csrf-token");

    const csrfCookie = cookieStore.get("XSRF-TOKEN")?.value;
    const csrfToken = csrfHeader || csrfCookie;

    // 3. Xây dựng Cookie header gửi sang backend (bao gồm cả XSRF-TOKEN)
    const allCookies = cookieStore.getAll();
    const cookieMap = new Map<string, string>();
    for (const c of allCookies) {
      cookieMap.set(c.name, c.value);
    }
    if (csrfToken) {
      cookieMap.set("XSRF-TOKEN", csrfToken);
    }
    const cookieHeader = Array.from(cookieMap.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");

    return serverClient.create({
      headers: {
        ...(deviceId && {
          "x-device-id": deviceId,
        }),

        ...(accessToken && {
          Authorization: `Bearer ${accessToken}`,
        }),

        ...(csrfToken && {
          "x-xsrf-token": csrfToken,
        }),

        ...(cookieHeader && {
          Cookie: cookieHeader,
        }),

        ...(config?.headers ?? {}),
      },

      withCredentials: true,
    });
  }

  private async handleError(error: unknown): Promise<never> {
    if (axios.isAxiosError(error)) {
      const response = error.response?.data as ApiErrorResponse | undefined;

      if (response) {
        throw new ApiError(response);
      }
    }

    throw error;
  }

  async get<T, P = Record<string, unknown>>(
    url: string,
    params?: P,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      const client = await this.createClient(config);

      return await client.get<ApiResponse<T>>(url, {
        ...(config ?? {}),

        ...(params && {
          params,
        }),
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
      const client = await this.createClient(config);

      return await client.post<ApiResponse<T>>(url, data, config ?? {});
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
      const client = await this.createClient(config);

      return await client.put<ApiResponse<T>>(url, data, config ?? {});
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
      const client = await this.createClient(config);

      return await client.patch<ApiResponse<T>>(url, data, config ?? {});
    } catch (error) {
      return await this.handleError(error);
    }
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      const client = await this.createClient(config);

      return await client.delete<ApiResponse<T>>(url, config ?? {});
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
      const client = await this.createClient(config);

      return await client.post<ApiResponse<T>>(url, data, config ?? {});
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data as ApiErrorResponse | undefined;

        if (response) {
          throw new ApiError(response);
        }
      }

      throw error;
    }
  }
}

export const serverApiClient = new ServerApiClient();
