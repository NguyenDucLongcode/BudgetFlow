import type { AxiosRequestConfig } from "axios";
import { axiosClient } from "../axios/axio-client";

class BrowserApiClient {
  get<T>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return axiosClient
      .get<T>(url, {
        ...(config ?? {}),
        ...(params ? { params } : {}),
      })
      .then((response) => response.data);
  }

  post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T> {
    return axiosClient
      .post<T>(url, data, config ?? {})
      .then((response) => response.data);
  }

  put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T> {
    return axiosClient
      .put<T>(url, data, config ?? {})
      .then((response) => response.data);
  }

  patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T> {
    return axiosClient
      .patch<T>(url, data, config ?? {})
      .then((response) => response.data);
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axiosClient
      .delete<T>(url, config ?? {})
      .then((response) => response.data);
  }
}

export const browserApiClient = new BrowserApiClient();
