export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}

export class AuthService {
  login(data: LoginDto) {
    return serverApiClient.post("/auth/login", data);
  }

  logout() {
    return serverApiClient.post("/auth/logout");
  }

  profile() {
    return serverApiClient.get("/auth/profile");
  }

  refresh() {
    return serverApiClient.post("/auth/refresh-token");
  }
}

export const authService = new AuthService();
