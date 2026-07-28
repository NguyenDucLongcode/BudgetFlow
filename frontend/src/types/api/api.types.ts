import type { AxiosResponse } from "axios";

// this interface represents the structure of a successful response from the API.
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

/**
 * HTTP response returned by the API client.
 * Includes the response body together with HTTP metadata.
 */
export interface ApiHttpResponse<T> {
  data: T;
  status: number;
  headers: AxiosResponse["headers"];
}

// This interface represents the structure of an error response from the API.
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  type: string;
  path: string;
}

// This class represents an error that occurs when making a request to the API.
// It extends the built-in Error class and includes additional properties for the status code, timestamp, and path of the error.
export class ApiError extends Error {
  statusCode: number;
  timestamp: string;
  path: string;

  constructor(error: ApiErrorResponse) {
    super(error.message);

    this.name = "ApiError";
    this.statusCode = error.statusCode;
    this.timestamp = error.timestamp;
    this.path = error.path;
  }
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface AppError extends Error {
  statusCode: number;
}
