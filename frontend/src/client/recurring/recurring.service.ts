import { browserApiClient } from "@/src/lib/bff";
import type {
  RecurringTransaction,
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
  RecurringQueryParams,
  ApiResponse,
  PaginationResponse,
} from "@/src/types";

export interface PaginatedRecurringResponse {
  items: RecurringTransaction[];
  pagination: PaginationResponse;
}

class RecurringService {
  async getAll(
    params?: RecurringQueryParams,
  ): Promise<PaginatedRecurringResponse> {
    const res = await browserApiClient.get<
      ApiResponse<RecurringTransaction[]> | RecurringTransaction[]
    >("/recurring-transactions", params as Record<string, unknown>);

    const rawData = res.data;
    const isWrapped =
      typeof rawData === "object" && rawData !== null && "data" in rawData;
    const data: RecurringTransaction[] = isWrapped
      ? (rawData as ApiResponse<RecurringTransaction[]>).data
      : Array.isArray(rawData)
        ? (rawData as RecurringTransaction[])
        : [];
    const pagination: PaginationResponse =
      isWrapped && (rawData as ApiResponse<RecurringTransaction[]>).pagination
        ? (rawData as ApiResponse<RecurringTransaction[]>).pagination!
        : {
            page: Number(params?.page) || 1,
            limit: Number(params?.limit) || 50,
            total: Array.isArray(data) ? data.length : 0,
            totalPages: 1,
          };

    return {
      items: Array.isArray(data) ? data : [],
      pagination,
    };
  }

  async create(
    data: CreateRecurringTransactionInput,
  ): Promise<RecurringTransaction> {
    const res = await browserApiClient.post<
      ApiResponse<RecurringTransaction> | RecurringTransaction
    >("/recurring-transactions", data);
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<RecurringTransaction>).data;
    }
    return rawData as RecurringTransaction;
  }

  async update(
    id: string,
    data: UpdateRecurringTransactionInput,
  ): Promise<RecurringTransaction> {
    const res = await browserApiClient.patch<
      ApiResponse<RecurringTransaction> | RecurringTransaction
    >(`/recurring-transactions/${id}`, data);
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<RecurringTransaction>).data;
    }
    return rawData as RecurringTransaction;
  }

  async remove(id: string): Promise<void> {
    await browserApiClient.delete(`/recurring-transactions/${id}`);
  }

  async pause(id: string): Promise<RecurringTransaction> {
    const res = await browserApiClient.patch<
      ApiResponse<RecurringTransaction> | RecurringTransaction
    >(`/recurring-transactions/${id}/pause`);
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<RecurringTransaction>).data;
    }
    return rawData as RecurringTransaction;
  }

  async resume(id: string): Promise<RecurringTransaction> {
    const res = await browserApiClient.patch<
      ApiResponse<RecurringTransaction> | RecurringTransaction
    >(`/recurring-transactions/${id}/resume`);
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<RecurringTransaction>).data;
    }
    return rawData as RecurringTransaction;
  }
}

export const recurringService = new RecurringService();
