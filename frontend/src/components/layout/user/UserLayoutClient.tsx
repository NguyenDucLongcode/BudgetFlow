"use client";

import { useState } from "react";
import { UserSidebar } from "./UserSidebar";
import { UserTopbar } from "./UserTopbar";
import { useAuth } from "@/src/hooks/useAuth";
import { useSocketNotification } from "@/src/hooks/useSocketNotification";
import type { UserProfile } from "@/src/types/api";

interface UserLayoutClientProps {
  initialUser?: UserProfile | null;
  children: React.ReactNode;
}

export function UserLayoutClient({
  initialUser,
  children,
}: UserLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const currentUser = user || initialUser;

  // Lắng nghe sự kiện realtime qua WebSocket
  useSocketNotification(currentUser?.id);

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-slate-100 font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-400">
      {/* Sidebar (Desktop fixed + Mobile Drawer) */}
      <UserSidebar
        user={currentUser}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Topbar */}
        <UserTopbar
          user={currentUser}
          onMenuToggle={() => setMobileOpen(true)}
        />

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
