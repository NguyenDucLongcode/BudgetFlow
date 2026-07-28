import { Shield, UserCheck, Users, UserX } from "lucide-react";
import { StatItem } from "./type";

export const STATS: StatItem[] = [
  {
    key: "total",
    title: "Total Users",
    icon: Users,
    color: "emerald",
  },
  {
    key: "active",
    title: "Active Users",
    icon: UserCheck,
    color: "blue",
  },
  {
    key: "suspended",
    title: "Suspended Users",
    icon: UserX,
    color: "amber",
  },
  {
    key: "admins",
    title: "Administrators",
    icon: Shield,
    color: "slate",
  },
];
