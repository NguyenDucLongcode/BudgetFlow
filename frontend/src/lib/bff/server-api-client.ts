import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { cookies, headers } from "next/headers";

import { serverClient } from "../axios/axio-server";
import type { ApiErrorResponse, ApiResponse } from "@/src/types/api/api.types";
import { ApiError } from "@/src/types/api/api.types";
import { accessTokenStore } from "@/src/server/modules/auth/session";

class ServerApiClient {
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
      const client = await this.createClient();

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
      const client = await this.createClient();

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
      const client = await this.createClient();

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
      const client = await this.createClient();

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
      const client = await this.createClient();

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
      const client = await this.createClient();

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
