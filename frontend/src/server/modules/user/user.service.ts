import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { UserProfile } from "@/src/types/api";

class UserService {
  getMe() {
    return serverApiClient.get<UserProfile>("/users/me");
  }
}

export const userService = new UserService();
