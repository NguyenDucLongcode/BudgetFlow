import { browserApiClient } from "@/src/lib/bff";
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterParams,
  TransactionStatistics,
} from "@/src/types/api";

export interface PaginatedTransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class TransactionService {
  async getTransactions(
    params?: TransactionFilterParams,
  ): Promise<PaginatedTransactionsResponse> {
    const res = await browserApiClient.get<any>(
      "/transactions",
      params as Record<string, unknown>,
    );
    const rawData = res.data as any;

    const data = rawData?.data ?? rawData;
    const pagination = rawData?.pagination ?? {
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
    const res = await browserApiClient.get<any>(`/transactions/${id}`);
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }

  async createTransaction(data: CreateTransactionInput): Promise<Transaction> {
    const res = await browserApiClient.post<any>("/transactions", data);
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }

  async updateTransaction(
    id: string,
    data: UpdateTransactionInput,
  ): Promise<Transaction> {
    const res = await browserApiClient.patch<any>(`/transactions/${id}`, data);
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }

  async deleteTransaction(id: string): Promise<void> {
    await browserApiClient.delete<void>(`/transactions/${id}`);
  }

  async getStatistics(params?: {
    fromDate?: string;
    toDate?: string;
  }): Promise<TransactionStatistics> {
    const res = await browserApiClient.get<any>(
      "/transactions/statistics",
      params as Record<string, unknown>,
    );
    const rawData = res.data as any;
    const stats = rawData?.data ?? rawData;
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
