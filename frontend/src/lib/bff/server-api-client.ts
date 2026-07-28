import axios, { type AxiosRequestConfig } from "axios";
import { cookies, headers } from "next/headers";

import { serverClient } from "../axios/axio-server";
import type {
  ApiErrorResponse,
  ApiHttpResponse,
  ApiResponse,
} from "@/src/types/api/api.types";
import { ApiError } from "@/src/types/api/api.types";
import { accessTokenStore } from "@/src/server/modules/auth/session";
import { authService } from "@/src/server/modules/auth/auth.service";

class RetryRequestError extends Error {
  constructor() {
    super("RETRY_REQUEST");
    this.name = "RetryRequestError";
  }
}

class ServerApiClient {
  private refreshing: Promise<void> | null = null;

  /**
   * Tạo axios client có auth
   */
  private async createClient() {
    const cookieStore = await cookies();
    const headerStore = await headers();

    const deviceId = headerStore.get("x-device-id");

    const session = deviceId ? await accessTokenStore.get(deviceId) : null;

    return serverClient.create({
      headers: {
        ...(deviceId && {
          "x-device-id": deviceId,
        }),

        ...(session?.accessToken && {
          Authorization: `Bearer ${session.accessToken}`,
        }),

        ...(cookieStore.toString() && {
          Cookie: cookieStore.toString(),
        }),
      },

      withCredentials: true,
    });
  }

  /**
   * Refresh token có lock
   */
  private async refreshToken() {
    if (!this.refreshing) {
      this.refreshing = authService
        .refresh()
        .then(() => {})
        .finally(() => {
          this.refreshing = null;
        });
    }

    return this.refreshing;
  }
  /**
   * Xử lý lỗi
   */
  private async handleError(error: unknown): Promise<never> {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        await this.refreshToken();

        throw new RetryRequestError();
      }

      const response = error.response?.data as ApiErrorResponse | undefined;

      if (response) {
        throw new ApiError(response);
      }
    }

    throw error;
  }

  /**
   * Execute + retry 1 lần
   */
  private async execute<T>(
    callback: () => Promise<T>,
    retry = true,
  ): Promise<T> {
    try {
      return await callback();
    } catch (error) {
      if (error instanceof RetryRequestError && retry) {
        return this.execute(callback, false);
      }

      throw error;
    }
  }

  async get<T>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.execute(async () => {
      try {
        const client = await this.createClient();

        const response = await client.get<ApiResponse<T>>(url, {
          ...(config ?? {}),

          ...(params && {
            params,
          }),
        });

        return response.data.data;
      } catch (error) {
        return await this.handleError(error);
      }
    });
  }

  async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T> {
    return this.execute(async () => {
      try {
        const client = await this.createClient();

        const response = await client.post<ApiResponse<T>>(
          url,
          data,
          config ?? {},
        );

        return response.data.data;
      } catch (error) {
        return await this.handleError(error);
      }
    });
  }

  /**
   * Dùng cho login / refresh
   * Không retry
   */
  async postRaw<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<ApiHttpResponse<ApiResponse<T>>> {
    try {
      const client = await this.createClient();

      const response = await client.post<ApiResponse<T>>(
        url,
        data,
        config ?? {},
      );

      return {
        data: response.data,

        status: response.status,

        headers: response.headers,
      };
    } catch (error) {
      return await this.handleError(error);
    }
  }

  async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T> {
    return this.execute(async () => {
      try {
        const client = await this.createClient();

        const response = await client.put<ApiResponse<T>>(
          url,
          data,
          config ?? {},
        );

        return response.data.data;
      } catch (error) {
        return await this.handleError(error);
      }
    });
  }

  async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T> {
    return this.execute(async () => {
      try {
        const client = await this.createClient();

        const response = await client.patch<ApiResponse<T>>(
          url,
          data,
          config ?? {},
        );

        return response.data.data;
      } catch (error) {
        return await this.handleError(error);
      }
    });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.execute(async () => {
      try {
        const client = await this.createClient();

        const response = await client.delete<ApiResponse<T>>(url, config ?? {});

        return response.data.data;
      } catch (error) {
        return await this.handleError(error);
      }
    });
  }
}

export const serverApiClient = new ServerApiClient();
