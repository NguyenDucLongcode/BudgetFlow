import { AuthTokenResponse } from "./type";
import type { AxiosRequestConfig } from "axios";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { parseExpiresIn } from "@/src/server/modules/auth/hepler";
import { accessTokenStore } from "@/src/server/modules/auth/session";
import { LoginDto, RegisterDto, RegisterResponse } from "@/src/types/api";

class AuthService {
  async login(data: LoginDto) {
    const response = await serverApiClient.post<AuthTokenResponse>(
      "/auth/login",
      data,
    );

    const { accessToken, deviceId, user, expiresIn } = response.data.data;

    // Lưu access token và device session vào Redis
    await accessTokenStore.save(
      deviceId,
      accessToken,
      user.id,
      user.role,
      parseExpiresIn(expiresIn),
    );

    return {
      ...response,
      data: {
        ...response.data,
        // Lưu deviceId và user vào data trả về
        data: {
          deviceId,
          user,
        },
      },
    };
  }

  async refresh(config?: AxiosRequestConfig) {
    const response = await serverApiClient.postWithoutRetry<AuthTokenResponse>(
      "/auth/refresh-token",
      undefined,
      config,
    );

    const { accessToken, deviceId, user, expiresIn } = response.data.data;

    // Lưu access token và device session vào Redis
    await accessTokenStore.save(
      deviceId,
      accessToken,
      user.id,
      user.role,
      parseExpiresIn(expiresIn),
    );

    return {
      ...response,
      data: {
        ...response.data,
        data: {
          deviceId,
          user,
        },
      },
    };
  }

  async logout(deviceId: string) {
    const response = await serverApiClient.post(
      "/auth/logout",
      undefined,
      {
        headers: {
          "x-device-id": deviceId,
        },
      },
    );

    // Xoá access token trong Redis BFF
    await accessTokenStore.remove(deviceId);

    return response;
  }

  async logoutAll(deviceId?: string) {
    const response = await serverApiClient.post("/auth/logout-all");

    if (deviceId) {
      await accessTokenStore.remove(deviceId);
    }

    return response;
  }

  async register(data: RegisterDto) {
    const response = await serverApiClient.post<RegisterResponse>(
      "/auth/register",
      data,
    );
    return response.data;
  }

  async verifyEmail(token: string) {
    const response = await serverApiClient.get<{ message: string }>(
      "/auth/verify-email",
      { token },
    );
    return response.data;
  }

  async resendVerificationEmail(email: string) {
    const response = await serverApiClient.post<{ message: string }>(
      "/auth/resend-verification-email",
      { email },
    );
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await serverApiClient.post<{ message: string }>(
      "/auth/forgot-password",
      { email },
    );
    return response.data;
  }

  async resetPassword(data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const response = await serverApiClient.post<{ message: string }>(
      "/auth/reset-password",
      data,
    );
    return response.data;
  }

  async saveSocialSession(
    deviceId: string,
    accessToken: string,
    userId: string,
    role: any,
    expiresIn = "15m",
  ) {
    await accessTokenStore.save(
      deviceId,
      accessToken,
      userId,
      role,
      parseExpiresIn(expiresIn),
    );
  }
}

export const authService = new AuthService();
