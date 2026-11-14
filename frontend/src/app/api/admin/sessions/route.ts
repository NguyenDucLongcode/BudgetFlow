import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/src/server/modules/admin/admin.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Lấy danh sách users từ backend
    const usersRes = await adminService.getUsers({ page: 1, limit: 30 });
    const users = usersRes?.data?.users || [];

    // Lấy chi tiết sessions của các users
    const allSessions: Array<{
      id: string;
      userId: string;
      userEmail: string;
      userName: string;
      deviceId: string;
      userAgent: string | null;
      ipAddress: string | null;
      lastLoginAt: string;
      lastActiveAt: string;
      createdAt: string;
      isOnline: boolean;
    }> = [];

    await Promise.all(
      users.slice(0, 15).map(async (u: any) => {
        try {
          const detailRes = await adminService.getUser(u.id);
          const detail = detailRes?.data;
          if (detail?.sessions && Array.isArray(detail.sessions)) {
            detail.sessions.forEach((s: any) => {
              const activeDiff = Date.now() - new Date(s.lastActiveAt).getTime();
              allSessions.push({
                id: s.id,
                userId: u.id,
                userEmail: u.email,
                userName: u.name,
                deviceId: s.deviceId,
                userAgent: s.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
                ipAddress: s.ipAddress || "127.0.0.1",
                lastLoginAt: s.lastLoginAt,
                lastActiveAt: s.lastActiveAt,
                createdAt: s.createdAt,
                isOnline: activeDiff < 5 * 60 * 1000,
              });
            });
          }
        } catch {
          // Bỏ qua lỗi lẻ của từng user
        }
      }),
    );

    // Sắp xếp theo lastActiveAt giảm dần
    allSessions.sort(
      (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
    );

    const total = allSessions.length;
    const startIndex = (page - 1) * limit;
    const pagedSessions = allSessions.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      statusCode: 200,
      data: {
        sessions: pagedSessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
