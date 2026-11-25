import { browserApiClient } from "@/src/lib/bff";
import type {
  Debt,
  DebtPayment,
  CreateDebtInput,
  UpdateDebtInput,
  CreateDebtPaymentInput,
  DebtQueryParams,
  DebtSummary,
  ApiResponse,
  PaginationResponse,
} from "@/src/types";

export interface PaginatedDebtsResponse {
  debts: Debt[];
  pagination: PaginationResponse;
}

class DebtService {
  async getDebts(
    params?: DebtQueryParams,
  ): Promise<PaginatedDebtsResponse> {
    const res = await browserApiClient.get<ApiResponse<Debt[]> | Debt[]>(
      "/debts",
      params as Record<string, unknown>,
    );
    const rawData = res.data;
    const isWrapped =
      typeof rawData === "object" && rawData !== null && "data" in rawData;
    const data: Debt[] = isWrapped
      ? (rawData as ApiResponse<Debt[]>).data
      : Array.isArray(rawData)
        ? (rawData as Debt[])
        : [];
    const pagination: PaginationResponse =
      isWrapped && (rawData as ApiResponse<Debt[]>).pagination
        ? (rawData as ApiResponse<Debt[]>).pagination!
        : {
            page: Number(params?.page) || 1,
            limit: Number(params?.limit) || 50,
            total: Array.isArray(data) ? data.length : 0,
            totalPages: 1,
          };

    return {
      debts: Array.isArray(data) ? data : [],
      pagination,
    };
  }

  async getDebt(id: string): Promise<Debt> {
    const res = await browserApiClient.get<ApiResponse<Debt> | Debt>(`/debts/${id}`);
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<Debt>).data;
    }
    return rawData as Debt;
  }

  async createDebt(data: CreateDebtInput): Promise<Debt> {
    const res = await browserApiClient.post<ApiResponse<Debt> | Debt>("/debts", data);
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<Debt>).data;
    }
    return rawData as Debt;
  }

  async updateDebt(id: string, data: UpdateDebtInput): Promise<Debt> {
    const res = await browserApiClient.patch<ApiResponse<Debt> | Debt>(`/debts/${id}`, data);
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<Debt>).data;
    }
    return rawData as Debt;
  }

  async deleteDebt(id: string): Promise<void> {
    await browserApiClient.delete(`/debts/${id}`);
  }

  async addPayment(id: string, data: CreateDebtPaymentInput): Promise<DebtPayment> {
    const res = await browserApiClient.post<ApiResponse<DebtPayment> | DebtPayment>(
      `/debts/${id}/payments`,
      data,
    );
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<DebtPayment>).data;
    }
    return rawData as DebtPayment;
  }

  async getPayments(id: string): Promise<DebtPayment[]> {
    const res = await browserApiClient.get<ApiResponse<DebtPayment[]> | DebtPayment[]>(
      `/debts/${id}/payments`,
    );
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<DebtPayment[]>).data;
    }
    return Array.isArray(rawData) ? (rawData as DebtPayment[]) : [];
  }

  async getSummary(): Promise<DebtSummary> {
    const res = await browserApiClient.get<ApiResponse<DebtSummary> | DebtSummary>(
      "/debts/summary",
    );
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<DebtSummary>).data;
    }
    return rawData as DebtSummary;
  }
}

export const debtService = new DebtService();
