"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Laptop,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";
import "./Admin-Topbar.scss";
import { useAuth } from "@/src/hooks";
import { Avatar } from "@/src/components/common/Avatar";
import { useLogout } from "@/src/client/auth";

interface AdminTopbarProps {
  onMenu: () => void;
}

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Overview", subtitle: "Platform health and key metrics" },
  "/admin/users": {
    title: "User Management",
    subtitle: "Manage accounts, roles, and access",
  },
  "/admin/sessions": {
    title: "Session Management",
    subtitle: "Monitor and revoke active sessions",
  },
  "/admin/audit": {
    title: "Audit Logs",
    subtitle: "Security activity and event history",
  },
  "/admin/wallets": {
    title: "Wallets",
    subtitle: "All platform wallets and balances",
  },
  "/admin/activity": {
    title: "Activity",
    subtitle: "Real-time platform activity",
  },
  "/admin/settings": { title: "Settings", subtitle: "Workspace configuration" },
};

export function AdminTopbar({ onMenu }: AdminTopbarProps) {
  const pathname = usePathname() || "";
  const { user } = useAuth();
  const { mutate: logout } = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Tìm meta phù hợp: thử match chính xác, nếu không thì match prefix (ví dụ /admin/users/123)
  let meta = TITLES[pathname];
  if (!meta) {
    // thử match prefix: lấy phần đầu tiên /admin và segment tiếp theo
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      // ví dụ /admin/users/... -> key là /admin/users
      const key = "/" + segments.slice(0, 2).join("/");
      meta = TITLES[key];
    }
    if (!meta && segments.length >= 1) {
      const key = "/" + segments[0];
      meta = TITLES[key];
    }
  }
  if (!meta) {
    meta = { title: "FinAdmin", subtitle: "" };
  }

  const isDetail =
    pathname.startsWith("/admin/users/") && pathname !== "/admin/users";

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = (all?: boolean) => {
    logout(all !== undefined ? { all } : undefined);
    setMenuOpen(false);
  };

  return (
    <header className="topbar">
      <button className="topbar-menu" onClick={onMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="topbar-title">
        <h1>{isDetail ? "User Detail" : meta.title}</h1>
        <p>
          {isDetail
            ? "Profile, sessions, wallets and audit trail"
            : meta.subtitle}
        </p>
      </div>

      <div className="topbar-search">
        <Search size={16} />
        <input placeholder="Search users, transactions, IDs…" />
        <span className="kbd">⌘K</span>
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="topbar-icon-dot" />
        </button>
        <div className="topbar-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className="topbar-profile"
            onClick={() => setMenuOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar
              name={user?.name || "Admin User"}
              avatarUrl={user?.avatar || ""}
              size={35}
              color="#10b981"
              className="topbar-profile-avatar"
            />
            <span className="topbar-profile-name">
              {user?.name || "Admin User"}
            </span>
            <ChevronDown
              size={14}
              className={menuOpen ? "topbar-profile-chevron-open" : ""}
            />
          </button>

          {menuOpen && (
            <div className="topbar-profile-menu" role="menu">
              <div className="topbar-profile-meta">
                <Avatar
                  name={user?.name || "Admin User"}
                  avatarUrl={user?.avatar || ""}
                  size={42}
                  color="#10b981"
                  className="topbar-profile-meta-avatar"
                />
                <div>
                  <strong>{user?.name || "Admin User"}</strong>
                  <span>{user?.email || "admin@budgetflow.local"}</span>
                </div>
              </div>

              <div className="topbar-profile-menu-group">
                <Link
                  href="/admin/sessions"
                  className="topbar-profile-menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <Laptop size={16} />
                  <span>Thiết bị</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="topbar-profile-menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings size={16} />
                  <span>Cài đặt</span>
                </Link>
                <button
                  type="button"
                  className="topbar-profile-menu-item"
                  onClick={() => handleLogout()}
                >
                  <LogOut size={16} />
                  <span>Đăng xuất thiết bị này</span>
                </button>
                <button
                  type="button"
                  className="topbar-profile-menu-item topbar-profile-menu-item-danger"
                  onClick={() => handleLogout(true)}
                >
                  <ShieldCheck size={16} />
                  <span>Đăng xuất tất cả thiết bị</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
