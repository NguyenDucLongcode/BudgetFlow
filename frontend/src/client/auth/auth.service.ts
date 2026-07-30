import { browserApiClient } from "@/src/lib/bff";
import { AuthResponse, LoginDto, UserProfile } from "@/src/types/api";

class AuthService {
  async login(data: LoginDto) {
    const res = await browserApiClient.post<AuthResponse>("/auth/login", data);

    return res.data;
  }

  logout() {
    return browserApiClient.post<void>("/auth/logout");
  }

  getProfile() {
    return browserApiClient.get<UserProfile>("/users/me");
  }
}

export const authService = new AuthService();
