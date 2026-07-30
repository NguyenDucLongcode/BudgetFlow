import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { UserProfile } from "@/src/types/api";

class UserService {
  async getMe() {
    const res = await serverApiClient.get<UserProfile>("/users/me");
    return res.data;
  }
}

export const userService = new UserService();
