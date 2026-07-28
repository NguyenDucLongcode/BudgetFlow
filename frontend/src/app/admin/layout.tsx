"use client";

import { useState } from "react";

import { cn } from "@/src/lib/utils";
import AuthProvider from "@/src/providers/AuthProvider";
import { AdminTopbar } from "@/src/components/layout/admin/Topbar/Admin-Topbar";
import { AdminSidebar } from "@/src/components";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <AdminSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className={cn("flex min-w-0 flex-1 flex-col", "lg:ml-65")}>
          {/* Topbar */}
          <AdminTopbar onMenu={() => setMobileOpen(true)} />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
