"use client";

import { usePathname } from "next/navigation";

import { useProfile } from "@/src/client/auth";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/verify-email",
  "/auth/social-success",
];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const enabled = !PUBLIC_ROUTES.includes(pathname);

  useProfile({
    enabled,
  });

  return children;
}
