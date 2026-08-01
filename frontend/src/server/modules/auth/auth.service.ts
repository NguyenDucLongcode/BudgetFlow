import { AuthTokenResponse } from "./type";
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

  async refresh() {
    const response = await serverApiClient.postWithoutRetry<AuthTokenResponse>(
      "/auth/refresh-token",
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
    const response = await serverApiClient.post("/auth/logout");

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
}

export const authService = new AuthService();
