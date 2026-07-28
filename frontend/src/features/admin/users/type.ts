import { StatCardColor } from "@/src/components";
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
