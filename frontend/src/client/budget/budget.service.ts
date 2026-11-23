import { browserApiClient } from "@/src/lib/bff";
import type {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetQueryParams,
  BudgetSummary,
  ApiResponse,
  PaginationResponse,
} from "@/src/types";

export interface PaginatedBudgetsResponse {
  budgets: Budget[];
  pagination: PaginationResponse;
}

class BudgetService {
  async getBudgets(
    params?: BudgetQueryParams,
  ): Promise<PaginatedBudgetsResponse> {
    const res = await browserApiClient.get<ApiResponse<Budget[]> | Budget[]>(
      "/budgets",
      params as Record<string, unknown>,
    );
    const rawData = res.data;
    const isWrapped = typeof rawData === "object" && rawData !== null && "data" in rawData;
    const data: Budget[] = isWrapped
      ? (rawData as ApiResponse<Budget[]>).data
      : Array.isArray(rawData)
        ? (rawData as Budget[])
        : [];
    const pagination: PaginationResponse =
      isWrapped && (rawData as ApiResponse<Budget[]>).pagination
        ? (rawData as ApiResponse<Budget[]>).pagination!
        : {
            page: Number(params?.page) || 1,
            limit: Number(params?.limit) || 50,
            total: Array.isArray(data) ? data.length : 0,
            totalPages: 1,
          };

    return {
      budgets: Array.isArray(data) ? data : [],
      pagination,
    };
  }

  async getBudget(id: string): Promise<Budget> {
    const res = await browserApiClient.get<ApiResponse<Budget> | Budget>(`/budgets/${id}`);
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<Budget>).data
      : (rawData as Budget);
  }

  async createBudget(data: CreateBudgetInput): Promise<Budget> {
    const res = await browserApiClient.post<ApiResponse<Budget> | Budget>("/budgets", data);
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<Budget>).data
      : (rawData as Budget);
  }

  async updateBudget(id: string, data: UpdateBudgetInput): Promise<Budget> {
    const res = await browserApiClient.patch<ApiResponse<Budget> | Budget>(`/budgets/${id}`, data);
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<Budget>).data
      : (rawData as Budget);
  }

  async deleteBudget(id: string): Promise<void> {
    await browserApiClient.delete<ApiResponse<null>>(`/budgets/${id}`);
  }

  async getSummary(params?: {
    fromDate?: string;
    toDate?: string;
    month?: number | string;
    year?: number | string;
  }): Promise<BudgetSummary> {
    const res = await browserApiClient.get<ApiResponse<BudgetSummary> | BudgetSummary>(
      "/budgets/summary",
      params as Record<string, unknown>,
    );
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<BudgetSummary>).data
      : (rawData as BudgetSummary);
  }
}

export const budgetService = new BudgetService();
