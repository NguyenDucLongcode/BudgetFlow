export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export enum CategoryType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export enum WalletType {
  CASH = "CASH",
  BANK = "BANK",
  E_WALLET = "E_WALLET",
  CREDIT = "CREDIT",
  INVESTMENT = "INVESTMENT",
}

export enum BudgetPeriod {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY",
  CUSTOM = "CUSTOM",
}

export enum GoalStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  PAUSED = "PAUSED",
}

export enum GoalPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum DebtType {
  LOAN = "LOAN",
  DEBT = "DEBT",
}

export enum DebtStatus {
  ACTIVE = "ACTIVE",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
  GITHUB = "GITHUB",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CREDIT_CARD = "CREDIT_CARD",
  E_WALLET = "E_WALLET",
  OTHER = "OTHER",
}

export enum RecurringFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum Currency {
  VND = "VND",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  CNY = "CNY",
  KRW = "KRW",
  AUD = "AUD",
  CAD = "CAD",
  CHF = "CHF",
  SEK = "SEK",
  NOK = "NOK",
  DKK = "DKK",
  NZD = "NZD",
  SGD = "SGD",
  HKD = "HKD",
  TWD = "TWD",
}

export enum BudgetType {
  SPENDING = "SPENDING",
  INCOME = "INCOME",
}

export enum AttachmentType {
  IMAGE = "IMAGE",
  PDF = "PDF",
  DOCUMENT = "DOCUMENT",
}

export enum AuditAction {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",

  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  RESTORE = "RESTORE",

  CHANGE_PASSWORD = "CHANGE_PASSWORD",
  RESET_PASSWORD = "RESET_PASSWORD",

  VERIFY_EMAIL = "VERIFY_EMAIL",
}
