import { AuthProvider, Currency, Role, UserStatus } from "./enums";

// ===== User =====
export interface User {
  id: string;
  email: string;
  avatar: string;
  name: string;
  role: Role;
  status: UserStatus;
  provider: AuthProvider;
  createdAt: string;
  updatedAt: string;
  timezone: string;
  deletedAt: string | null;
}

// ===== User Preference =====
export interface UserPreference {
  id: string;
  userId: string;
  language: string;
  currency: Currency;
  theme: "light" | "dark" | "system";
  weekStartsOn: number; // 0: Sunday, 1: Monday
  dateFormat: string;
  timeFormat: string;
  budgetNotification: boolean;
  goalNotification: boolean;
  debtNotification: boolean;
  recurringNotification: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== User Session =====
export interface UserSession {
  id: string;
  userId: string;
  deviceId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  isRemember: boolean;
  lastLoginAt: string;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}
