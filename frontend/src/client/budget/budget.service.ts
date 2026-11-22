import { browserApiClient } from "@/src/lib/bff";
import type {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetQueryParams,
  BudgetSummary,
} from "@/src/types/api";

export interface PaginatedBudgetsResponse {
  budgets: Budget[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class BudgetService {
  async getBudgets(
    params?: BudgetQueryParams,
  ): Promise<PaginatedBudgetsResponse> {
    const res = await browserApiClient.get<any>(
      "/budgets",
      params as Record<string, unknown>,
    );
    const rawData = res.data as any;
    const data = rawData?.data ?? rawData;
    const pagination = rawData?.pagination ?? {
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
    const res = await browserApiClient.get<any>(`/budgets/${id}`);
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }

  async createBudget(data: CreateBudgetInput): Promise<Budget> {
    const res = await browserApiClient.post<any>("/budgets", data);
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }

  async updateBudget(id: string, data: UpdateBudgetInput): Promise<Budget> {
    const res = await browserApiClient.patch<any>(`/budgets/${id}`, data);
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }

  async deleteBudget(id: string): Promise<void> {
    await browserApiClient.delete<void>(`/budgets/${id}`);
  }

  async getSummary(params?: {
    fromDate?: string;
    toDate?: string;
    month?: number | string;
    year?: number | string;
  }): Promise<BudgetSummary> {
    const res = await browserApiClient.get<any>(
      "/budgets/summary",
      params as Record<string, unknown>,
    );
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }
}

export const budgetService = new BudgetService();
