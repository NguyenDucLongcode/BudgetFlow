import { Currency, DebtStatus, DebtType, PaymentMethod } from "../enums";
import { Wallet } from "./wallet.types";
import { Transaction } from "./transaction.types";

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number | string;
  paymentDate: string;
  method: PaymentMethod;
  note?: string | null | undefined;
  transactionId?: string | null | undefined;
  transaction?: Transaction | null | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  userId: string;
  name: string;
  type: DebtType;
  totalAmount: number | string;
  paidAmount: number | string;
  remainingAmount?: number | undefined;
  progress?: number | undefined;
  percentage?: number | undefined;
  isOverdue?: boolean | undefined;
  currency: Currency;
  interestRate?: number | string | null | undefined;
  startDate: string;
  dueDate: string;
  monthlyPayment?: number | string | null | undefined;
  status: DebtStatus;
  description?: string | null | undefined;
  contactName?: string | null | undefined;
  borrower?: string | null | undefined;
  accountNumber?: string | null | undefined;
  walletId?: string | null | undefined;
  wallet?: Wallet | null | undefined;
  note?: string | null | undefined;
  transactionId?: string | null | undefined;
  transaction?: Transaction | null | undefined;
  reminderDate?: string | null | undefined;
  reminderSent?: boolean | undefined;
  payments?: DebtPayment[] | undefined;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null | undefined;
}

export interface CreateDebtInput {
  name: string;
  type: DebtType;
  totalAmount: number;
  startDate: string;
  dueDate: string;
  interestRate?: number | undefined;
  monthlyPayment?: number | undefined;
  status?: DebtStatus | undefined;
  contactName?: string | undefined;
  borrower?: string | undefined;
  description?: string | undefined;
  accountNumber?: string | undefined;
  walletId?: string | undefined;
  note?: string | undefined;
  currency?: Currency | undefined;
  reminderDate?: string | undefined;
}

export interface UpdateDebtInput {
  name?: string | undefined;
  type?: DebtType | undefined;
  totalAmount?: number | undefined;
  startDate?: string | undefined;
  dueDate?: string | undefined;
  interestRate?: number | null | undefined;
  monthlyPayment?: number | null | undefined;
  status?: DebtStatus | undefined;
  contactName?: string | null | undefined;
  borrower?: string | null | undefined;
  description?: string | null | undefined;
  accountNumber?: string | null | undefined;
  walletId?: string | null | undefined;
  note?: string | null | undefined;
  currency?: Currency | undefined;
  reminderDate?: string | null | undefined;
}

export interface CreateDebtPaymentInput {
  amount: number;
  walletId?: string | undefined;
  method?: PaymentMethod | undefined;
  note?: string | undefined;
  paymentDate?: string | undefined;
}

export interface DebtQueryParams {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  type?: DebtType | undefined;
  status?: DebtStatus | undefined;
  walletId?: string | undefined;
  sortBy?: string | undefined;
  order?: "asc" | "desc" | undefined;
}

export interface DebtSummary {
  totalDebts: number;
  totalAmount: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  loanTotal: number;
  loanPaid: number;
  loanRemaining: number;
  debtTotal: number;
  debtPaid: number;
  debtRemaining: number;
  activeLoans: number;
  activeDebts: number;
  paidDebts: number;
  overdueDebts: number;
}
