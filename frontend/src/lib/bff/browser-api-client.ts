import type { AxiosRequestConfig, AxiosResponse } from "axios";

import { axiosClient } from "../axios/axio-client";
import { ApiResponse } from "@/src/types/api";

class BrowserApiClient {
  private unwrap<T>(response: AxiosResponse<ApiResponse<T>>): T {
    return response.data.data;
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosClient.get<ApiResponse<T>>(url, config).then(this.unwrap);
  }

  post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return axiosClient
      .post<ApiResponse<T>>(url, data, config)
      .then(this.unwrap);
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return axiosClient.put<ApiResponse<T>>(url, data, config).then(this.unwrap);
  }

  patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return axiosClient
      .patch<ApiResponse<T>>(url, data, config)
      .then(this.unwrap);
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosClient.delete<ApiResponse<T>>(url, config).then(this.unwrap);
  }
}

export const browserApiClient = new BrowserApiClient();
