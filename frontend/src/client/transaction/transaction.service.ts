import { browserApiClient } from "@/src/lib/bff";
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterParams,
  TransactionStatistics,
  ApiResponse,
  PaginationResponse,
} from "@/src/types";

export interface PaginatedTransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationResponse;
}

interface RawStatisticsPayload {
  summary?: {
    totalIncome?: number;
    incomeCount?: number;
    totalExpense?: number;
    expenseCount?: number;
    netAmount?: number;
  };
  income?: {
    total?: number;
    count?: number;
    _sum?: { amount?: number };
    _count?: number;
  };
  expense?: {
    total?: number;
    count?: number;
    _sum?: { amount?: number };
    _count?: number;
  };
  net?: number;
}

class TransactionService {
  async getTransactions(
    params?: TransactionFilterParams,
  ): Promise<PaginatedTransactionsResponse> {
    const res = await browserApiClient.get<ApiResponse<Transaction[]> | Transaction[]>(
      "/transactions",
      params as Record<string, unknown>,
    );
    const rawData = res.data;
    const isWrapped = typeof rawData === "object" && rawData !== null && "data" in rawData;
    const data: Transaction[] = isWrapped
      ? (rawData as ApiResponse<Transaction[]>).data
      : Array.isArray(rawData)
        ? (rawData as Transaction[])
        : [];
    const pagination: PaginationResponse =
      isWrapped && (rawData as ApiResponse<Transaction[]>).pagination
        ? (rawData as ApiResponse<Transaction[]>).pagination!
        : {
            page: params?.page ?? 1,
            limit: params?.limit ?? 10,
            total: Array.isArray(data) ? data.length : 0,
            totalPages: 1,
          };

    return {
      transactions: Array.isArray(data) ? data : [],
      pagination,
    };
  }

  async getTransaction(id: string): Promise<Transaction> {
    const res = await browserApiClient.get<ApiResponse<Transaction> | Transaction>(`/transactions/${id}`);
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<Transaction>).data
      : (rawData as Transaction);
  }

  async createTransaction(data: CreateTransactionInput): Promise<Transaction> {
    const res = await browserApiClient.post<ApiResponse<Transaction> | Transaction>("/transactions", data);
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<Transaction>).data
      : (rawData as Transaction);
  }

  async updateTransaction(
    id: string,
    data: UpdateTransactionInput,
  ): Promise<Transaction> {
    const res = await browserApiClient.patch<ApiResponse<Transaction> | Transaction>(`/transactions/${id}`, data);
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<Transaction>).data
      : (rawData as Transaction);
  }

  async deleteTransaction(id: string): Promise<void> {
    await browserApiClient.delete<ApiResponse<null>>(`/transactions/${id}`);
  }

  async getStatistics(params?: {
    fromDate?: string;
    toDate?: string;
  }): Promise<TransactionStatistics> {
    const res = await browserApiClient.get<ApiResponse<RawStatisticsPayload> | RawStatisticsPayload>(
      "/transactions/statistics",
      params as Record<string, unknown>,
    );
    const rawData = res.data;
    const stats: RawStatisticsPayload =
      typeof rawData === "object" && rawData !== null && "data" in rawData
        ? (rawData as ApiResponse<RawStatisticsPayload>).data
        : (rawData as RawStatisticsPayload);
    const summary = stats?.summary ?? {};

    const totalIncome = Number(
      summary?.totalIncome ??
      stats?.income?.total ??
      stats?.income?._sum?.amount ??
      0,
    );
    const incomeCount = Number(
      summary?.incomeCount ??
      stats?.income?.count ??
      stats?.income?._count ??
      0,
    );

    const totalExpense = Number(
      summary?.totalExpense ??
      stats?.expense?.total ??
      stats?.expense?._sum?.amount ??
      0,
    );
    const expenseCount = Number(
      summary?.expenseCount ??
      stats?.expense?.count ??
      stats?.expense?._count ??
      0,
    );

    const net = Number(
      summary?.netAmount ??
      stats?.net ??
      totalIncome - totalExpense,
    );

    return {
      income: {
        total: totalIncome,
        count: incomeCount,
      },
      expense: {
        total: totalExpense,
        count: expenseCount,
      },
      net,
    };
  }
}

export const transactionService = new TransactionService();
