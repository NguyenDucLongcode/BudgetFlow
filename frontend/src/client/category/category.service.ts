import { browserApiClient } from "@/src/lib/bff";
import type { TransactionCategory, ApiResponse } from "@/src/types";

class CategoryService {
  async getCategories(type?: "INCOME" | "EXPENSE" | "ALL"): Promise<TransactionCategory[]> {
    const params: Record<string, unknown> = {
      page: 1,
      limit: 100,
    };
    if (type && type !== "ALL") {
      params.type = type;
    }
    const res = await browserApiClient.get<ApiResponse<TransactionCategory[]> | TransactionCategory[]>(
      "/categories",
      params,
    );
    const rawData = res.data;
    if (Array.isArray(rawData)) {
      return rawData;
    }
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      const nested = (rawData as ApiResponse<TransactionCategory[]>).data;
      if (Array.isArray(nested)) {
        return nested;
      }
    }
    return [];
  }
}

export const categoryService = new CategoryService();
