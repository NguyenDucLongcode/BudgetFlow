import { TransactionType, TransactionStatus } from "../enums";
import { Wallet } from "./wallet.types";

export interface TransactionCategory {
  id: string;
  name: string;
  type?: string | undefined;
  icon?: string | undefined;
  color?: string | undefined;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description?: string | undefined;
  note?: string | undefined;
  date: string;
  status: TransactionStatus;
  walletId?: string | undefined;
  categoryId?: string | undefined;
  fromWalletId?: string | undefined;
  toWalletId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  reference?: string | undefined;
  wallet?: Wallet | undefined;
  category?: TransactionCategory | undefined;
  fromWallet?: Wallet | undefined;
  toWallet?: Wallet | undefined;
  tags?: { id: string; name: string }[] | undefined;
  attachments?: { id: string; fileName: string; fileUrl: string; fileSize?: number | undefined; fileType?: string | undefined }[] | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  currency?: string | undefined;
  description?: string | undefined;
  note?: string | undefined;
  date?: string | undefined;
  status?: TransactionStatus | undefined;
  walletId?: string | undefined;
  categoryId?: string | undefined;
  fromWalletId?: string | undefined;
  toWalletId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  reference?: string | undefined;
}

export interface UpdateTransactionInput {
  amount?: number | undefined;
  currency?: string | undefined;
  description?: string | undefined;
  note?: string | undefined;
  date?: string | undefined;
  status?: TransactionStatus | undefined;
  walletId?: string | undefined;
  categoryId?: string | undefined;
  fromWalletId?: string | undefined;
  toWalletId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  reference?: string | undefined;
}

export interface TransactionFilterParams {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  type?: TransactionType | "ALL" | undefined;
  status?: TransactionStatus | "ALL" | undefined;
  walletId?: string | undefined;
  categoryId?: string | undefined;
  fromDate?: string | undefined;
  toDate?: string | undefined;
  sortBy?: string | undefined;
  order?: "asc" | "desc" | undefined;
}

export interface TransactionStatistics {
  income: {
    total: number;
    count: number;
  };
  expense: {
    total: number;
    count: number;
  };
  net: number;
}
