import { Role, UserStatus } from "../enums";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  status: UserStatus;
  provider?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
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

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  status: UserStatus;
  provider?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}
