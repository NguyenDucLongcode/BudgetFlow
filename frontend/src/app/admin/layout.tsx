import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { userService } from "@/src/server/modules/user/user.service";
import { AdminLayoutClient } from "@/src/components/layout/admin/AdminLayoutClient";
import type { UserProfile } from "@/src/types/api";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Nếu không có cookie refresh_token -> chuyển về /login
  if (!refreshToken) {
    console.log(
      "[AdminLayout] No refresh_token cookie found -> redirecting to /login",
    );
    redirect("/login");
  }

  let currentUser: UserProfile | null = null;
  let serverError: string | null = null;

  try {
    const res = await userService.getMe();
    currentUser = res.data;

    // Ràng buộc bảo mật tối thượng: Phải có quyền ADMIN
    if (currentUser && currentUser.role !== "ADMIN") {
      console.warn(
        `[AdminLayout] User role (${currentUser.role}) is not ADMIN -> redirect to /dashboard`,
      );
      redirect("/dashboard");
    }
  } catch (err: any) {
    serverError = err?.message || "Failed to load user profile on server";
    console.warn("[AdminLayout] userService.getMe() note:", serverError);
  }

  return (
    <AdminLayoutClient user={currentUser} initialError={serverError}>
      {children}
    </AdminLayoutClient>
  );
}
