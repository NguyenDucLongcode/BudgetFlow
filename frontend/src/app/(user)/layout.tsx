import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { userService } from "@/src/server/modules/user/user.service";
import { UserLayoutClient } from "@/src/components/layout/user/UserLayoutClient";
import type { UserProfile } from "@/src/types/api";
import "react-toastify/dist/ReactToastify.css";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Nếu không có refresh token -> redirect về /login
  if (!refreshToken) {
    redirect("/login");
  }

  let currentUser: UserProfile | null = null;
  try {
    const res = await userService.getMe();
    currentUser = res.data;
  } catch (err) {
    console.warn("[UserLayout] userService.getMe() note:", err instanceof Error ? err.message : String(err));
  }

  return (
    <UserLayoutClient initialUser={currentUser}>
      {children}
    </UserLayoutClient>
  );
}
