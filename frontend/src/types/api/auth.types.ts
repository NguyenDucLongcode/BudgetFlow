import { Role } from "../enums";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  provider?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  deviceId: string;
  user: AuthUser;
}
