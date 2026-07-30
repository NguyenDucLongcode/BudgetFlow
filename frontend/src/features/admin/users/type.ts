import { StatCardColor } from "@/src/components";
import { Role, UserStatus } from "@/src/types";
import { Users } from "lucide-react";

export interface UserCounts {
  total: number;
  active: number;
  suspended: number;
  admins: number;
}

export interface StatItem {
  key: keyof UserCounts;

  title: string;

  icon: typeof Users;

  color: StatCardColor;
}

export interface UserCounts {
  total: number;
  active: number;
  suspended: number;
  admins: number;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;

  avatar?: string | null | undefined;

  role: Role;
  status: UserStatus;

  createdAt: string;
}
