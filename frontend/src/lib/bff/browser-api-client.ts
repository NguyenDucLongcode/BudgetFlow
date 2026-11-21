import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { axiosClient } from "../axios/axio-client";
import { ApiResponse } from "@/src/types";

class BrowserApiClient {
  async get<T>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    // Tự động tháo gỡ nếu caller truyền dạng { params: { ... } }
    const actualParams =
      params &&
      typeof params === "object" &&
      "params" in params &&
      Object.keys(params).length === 1 &&
      params.params &&
      typeof params.params === "object"
        ? (params.params as Record<string, unknown>)
        : params;

    return axiosClient.get<ApiResponse<T>>(url, {
      ...config,
      ...(actualParams && { params: actualParams }),
    });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return axiosClient.post<ApiResponse<T>>(url, data, config);
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return axiosClient.put<ApiResponse<T>>(url, data, config);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return axiosClient.patch<ApiResponse<T>>(url, data, config);
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return axiosClient.delete<ApiResponse<T>>(url, config);
  }
}

export const browserApiClient = new BrowserApiClient();
