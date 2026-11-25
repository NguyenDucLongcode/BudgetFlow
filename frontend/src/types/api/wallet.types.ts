import { WalletType } from "../enums";

export interface Wallet {
  id: string;
  userId: string;
  nameVi: string;
  nameEn?: string | null;
  name?: string;
  type: WalletType;
  balance: number | string;
  initialBalance: number | string;
  currency: string;
  icon?: string | null;
  color?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  description?: string | null;
  isDefault: boolean;
  isArchived: boolean;
  autoSync?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletInput {
  nameVi: string;
  nameEn?: string | undefined;
  name?: string | undefined;
  type: WalletType;
  initialBalance?: number | undefined;
  currency?: string | undefined;
  icon?: string | null | undefined;
  color?: string | null | undefined;
  bankName?: string | null | undefined;
  accountNumber?: string | null | undefined;
  accountName?: string | null | undefined;
  description?: string | null | undefined;
  isDefault?: boolean | undefined;
}

export interface UpdateWalletInput {
  nameVi?: string | undefined;
  nameEn?: string | undefined;
  name?: string | undefined;
  currency?: string | undefined;
  initialBalance?: number | undefined;
  icon?: string | null | undefined;
  color?: string | null | undefined;
  bankName?: string | null | undefined;
  accountNumber?: string | null | undefined;
  accountName?: string | null | undefined;
  description?: string | null | undefined;
  isDefault?: boolean | undefined;
  isArchived?: boolean | undefined;
}

export interface WalletQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  type?: WalletType;
  isDefault?: boolean | string;
  isArchived?: boolean | string;
  sortBy?: "name" | "balance" | "createdAt";
  order?: "asc" | "desc";
}
