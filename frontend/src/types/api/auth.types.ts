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
  language?: string;
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
  language?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  language?: string;
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
  language?: string;
  createdAt: string;
  updatedAt: string;
}
