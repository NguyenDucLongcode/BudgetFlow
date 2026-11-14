import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

import { getCsrfToken } from "@/src/lib/bff/utils/csrf";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type");

    // Gọi backend GET /categories
    const res = await serverApiClient.get<any>("/categories", {
      page: 1,
      limit: 100,
      ...(search && { search }),
      ...(type && type !== "ALL" && { type }),
    });

    const rawList = res.data?.data?.categories || res.data?.data || [];

    // Lọc các category hệ thống (isSystem = true)
    let systemCategories = Array.isArray(rawList)
      ? rawList.filter((c: any) => c.isSystem === true || !c.userId)
      : [];

    // Nếu backend chưa có sẵn hoặc user categories lẫn, tạo danh sách mẫu mặc định phong phú nếu cần
    if (systemCategories.length === 0) {
      systemCategories = [
        { id: "cat_sys_1", name: "Lương & Thưởng", type: "INCOME", icon: "Banknote", color: "#10B981", isSystem: true, createdAt: new Date().toISOString() },
        { id: "cat_sys_2", name: "Đầu tư & Cổ tức", type: "INCOME", icon: "TrendingUp", color: "#3B82F6", isSystem: true, createdAt: new Date().toISOString() },
        { id: "cat_sys_3", name: "Tiền lãi tiết kiệm", type: "INCOME", icon: "PiggyBank", color: "#06B6D4", isSystem: true, createdAt: new Date().toISOString() },
        { id: "cat_sys_4", name: "Ăn uống & Nhà hàng", type: "EXPENSE", icon: "Utensils", color: "#EF4444", isSystem: true, createdAt: new Date().toISOString() },
        { id: "cat_sys_5", name: "Nhà ở & Tiền điện nước", type: "EXPENSE", icon: "Home", color: "#F59E0B", isSystem: true, createdAt: new Date().toISOString() },
        { id: "cat_sys_6", name: "Giao thông & Xăng xe", type: "EXPENSE", icon: "Car", color: "#8B5CF6", isSystem: true, createdAt: new Date().toISOString() },
        { id: "cat_sys_7", name: "Y tế & Sức khỏe", type: "EXPENSE", icon: "HeartPulse", color: "#EC4899", isSystem: true, createdAt: new Date().toISOString() },
        { id: "cat_sys_8", name: "Giáo dục & Khóa học", type: "EXPENSE", icon: "GraduationCap", color: "#6366F1", isSystem: true, createdAt: new Date().toISOString() },
      ];
    }

    return NextResponse.json({
      statusCode: 200,
      data: systemCategories,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const csrfToken = await getCsrfToken(request);
    const res = await serverApiClient.post<any>(
      "/categories",
      {
        ...body,
        isSystem: true,
      },
      csrfToken
        ? {
            headers: {
              "x-xsrf-token": csrfToken,
            },
          }
        : undefined,
    );
    return NextResponse.json(res.data);
  } catch (error) {
    return handleApiError(error);
  }
}
