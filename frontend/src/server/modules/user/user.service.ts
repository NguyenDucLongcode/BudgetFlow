import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { UserProfile } from "@/src/types/api";

class UserService {
  async getMe() {
    const res = await serverApiClient.get<UserProfile>("/users/me");
    return res.data;
  }

  async updatePreferences(data: { language?: "VI" | "EN" | string }) {
    const res = await serverApiClient.patch("/users/preferences", data);
    return res.data;
  }
}

export const userService = new UserService();
