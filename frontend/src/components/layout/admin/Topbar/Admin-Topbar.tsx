"use client";

import { usePathname } from "next/navigation";
import { Menu, Search, Bell, ChevronDown } from "lucide-react";
import "./Admin-Topbar.scss";

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
        <div className="topbar-profile">
          <div
            className="topbar-profile-avatar"
            style={{ background: "#10b981" }}
          >
            AM
          </div>
          <span className="topbar-profile-name">Alex Morgan</span>
          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  );
}
