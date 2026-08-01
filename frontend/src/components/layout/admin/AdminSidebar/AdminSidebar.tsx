"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ScrollText,
  Wallet,
  Activity,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "./AdminSidebar.scss";
import { useAuth } from "@/src/hooks/useAuth";
import { Avatar } from "@/src/components/common/Avatar";
import { useLogout } from "@/src/client/auth";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV = [
  {
    href: "/admin/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/sessions", label: "Sessions", icon: ShieldCheck },
  { href: "/admin/audit", label: "Audit Logs", icon: ScrollText },
];

const SECONDARY = [
  { href: "/admin/wallets", label: "Wallets", icon: Wallet },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { mutate: logout } = useLogout();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout({
      all: false,
      redirectTo: "/login",
    });
  };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={cn("sidebar", open && "sidebar-open")}>
        <div className="sidebar-head">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-name">FinAdmin</span>
              <span className="sidebar-logo-sub">Ops Console</span>
            </div>
          </div>
          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-label">Operations</p>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "sidebar-link",
                isActive(item.href, item.exact) && "sidebar-link-active",
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}

          <p className="sidebar-label">System</p>
          {SECONDARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "sidebar-link",
                isActive(item.href) && "sidebar-link-active",
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <Avatar
              name={user?.name || "Admin User"}
              avatarUrl={user?.avatar || ""}
              size={35}
              className="sidebar-user-avatar"
              color="#10b981"
            />
            <div className="sidebar-user-text">
              <span className="sidebar-user-name">
                {user?.name || "Admin User"}
              </span>
              <span className="sidebar-user-role">Super Admin</span>
            </div>
            <button
              className="sidebar-user-logout"
              aria-label="Sign out"
              onClick={handleLogout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
