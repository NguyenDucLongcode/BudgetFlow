import { AuthResponse, AuthUser } from "@/src/types/api";
import { ApiHttpResponse, ApiResponse } from "@/src/types/api/api.types";
import { Role } from "@/src/types/enums";

// Type cho session access token
export interface AccessTokenSession {
  accessToken: string;

  userId: string;

  role: Role;

  deviceId: string;

  expiresAt: number;
}

// Dùng cho login + refresh từ backend
export interface AuthTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  deviceId: string;
  user: AuthUser;
}

export type AuthApiHttpResponse = ApiHttpResponse<ApiResponse<AuthResponse>>;
