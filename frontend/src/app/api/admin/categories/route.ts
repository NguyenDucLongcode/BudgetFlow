import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";
import type { Category, ApiResponse } from "@/src/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type");

    // Gọi backend GET /categories
    const res = await serverApiClient.get<ApiResponse<Category[]> | Category[]>("/categories", {
      page: 1,
      limit: 100,
      ...(search && { search }),
      ...(type && type !== "ALL" && { type }),
    });

    const resData = res.data;
    const rawList =
      typeof resData === "object" && resData !== null && "data" in resData
        ? (resData as ApiResponse<Category[]>).data
        : Array.isArray(resData)
          ? resData
          : [];

    // Lọc các category hệ thống (isSystem = true)
    let systemCategories = Array.isArray(rawList)
      ? rawList.filter((c: Category) => c.isSystem === true || !c.userId)
      : [];

    // Nếu backend chưa có sẵn hoặc user categories lẫn, tạo danh sách mẫu mặc định phong phú nếu cần
    if (systemCategories.length === 0) {
      systemCategories = [
        { id: "cat_sys_1", name: "Lương & Thưởng", nameVi: "Lương & Thưởng", nameEn: "Salary & Bonus", type: "INCOME" as const, icon: "Banknote", color: "#10B981", isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_sys_2", name: "Đầu tư & Cổ tức", nameVi: "Đầu tư & Cổ tức", nameEn: "Investments & Dividends", type: "INCOME" as const, icon: "TrendingUp", color: "#3B82F6", isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_sys_3", name: "Tiền lãi tiết kiệm", nameVi: "Tiền lãi tiết kiệm", nameEn: "Savings Interest", type: "INCOME" as const, icon: "PiggyBank", color: "#06B6D4", isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_sys_4", name: "Ăn uống & Nhà hàng", nameVi: "Ăn uống & Nhà hàng", nameEn: "Food & Dining", type: "EXPENSE" as const, icon: "Utensils", color: "#EF4444", isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_sys_5", name: "Nhà ở & Tiền điện nước", nameVi: "Nhà ở & Tiền điện nước", nameEn: "Housing & Utilities", type: "EXPENSE" as const, icon: "Home", color: "#F59E0B", isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_sys_6", name: "Giao thông & Xăng xe", nameVi: "Giao thông & Xăng xe", nameEn: "Transportation & Fuel", type: "EXPENSE" as const, icon: "Car", color: "#8B5CF6", isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_sys_7", name: "Y tế & Sức khỏe", nameVi: "Y tế & Sức khỏe", nameEn: "Healthcare", type: "EXPENSE" as const, icon: "HeartPulse", color: "#EC4899", isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_sys_8", name: "Giáo dục & Khóa học", nameVi: "Giáo dục & Khóa học", nameEn: "Education & Courses", type: "EXPENSE" as const, icon: "GraduationCap", color: "#6366F1", isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
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
    const res = await serverApiClient.post<ApiResponse<Category> | Category>("/categories", {
      ...body,
      isSystem: true,
    });
    return NextResponse.json(res.data);
  } catch (error) {
    return handleApiError(error);
  }
}
