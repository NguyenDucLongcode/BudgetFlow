import { browserApiClient } from "@/src/lib/bff";
import type { TransactionCategory } from "@/src/types/api";

class CategoryService {
  async getCategories(type?: "INCOME" | "EXPENSE" | "ALL"): Promise<TransactionCategory[]> {
    const params: Record<string, unknown> = {
      page: 1,
      limit: 100,
    };
    if (type && type !== "ALL") {
      params.type = type;
    }
    const res = await browserApiClient.get<any>("/categories", params);
    const rawData = res.data as any;
    // Backend trả về { message, data: [...], pagination: {...} }
    // rawData có thể là response object hoặc đã được unwrap bởi axios interceptor
    let list: any[] = [];
    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (Array.isArray(rawData?.data)) {
      list = rawData.data;
    } else if (Array.isArray(rawData?.data?.categories)) {
      list = rawData.data.categories;
    }

    // Dedup bằng Map theo id để tránh trùng lặp
    return Array.from(
      new Map<string, TransactionCategory>(
        list.map((item: any) => [item.id, item as TransactionCategory]),
      ).values(),
    );
  }
}

export const categoryService = new CategoryService();
