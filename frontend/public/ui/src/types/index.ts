export type UserRole = 'admin' | 'manager' | 'user'
export type UserStatus = 'active' | 'suspended' | 'pending'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  avatarColor: string
  createdAt: string
  lastActiveAt: string
  language: string
  currency: string
  theme: 'light' | 'dark' | 'system'
  dateFormat: string
  timeFormat: '12h' | '24h'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    transactionAlerts: boolean
    securityAlerts: boolean
  }
}

export type WalletType = 'checking' | 'savings' | 'credit' | 'investment' | 'crypto'

export interface Wallet {
  id: string
  userId: string
  name: string
  type: WalletType
  balance: number
  currency: string
  createdAt: string
}

export type TransactionType = 'income' | 'expense' | 'transfer'
export type TransactionStatus = 'completed' | 'pending' | 'failed'

export interface Transaction {
  id: string
  userId: string
  walletId: string
  type: TransactionType
  status: TransactionStatus
  amount: number
  currency: string
  description: string
  category: string
  merchant: string
  createdAt: string
}

export interface Session {
  id: string
  userId: string
  deviceId: string
  browser: string
  ipAddress: string
  location: string
  lastLoginAt: string
  lastActiveAt: string
  status: 'active' | 'expired' | 'revoked'
}

export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_change'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_disabled'
  | 'wallet_created'
  | 'wallet_deleted'
  | 'transaction_created'
  | 'session_revoked'
  | 'role_changed'
  | 'settings_updated'

export interface AuditLog {
  id: string
  action: AuditAction
  userId: string
  userName: string
  entity: string
  entityId: string
  ipAddress: string
  userAgent: string
  createdAt: string
  severity: 'info' | 'warning' | 'critical'
}
