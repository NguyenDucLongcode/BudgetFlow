import type { User, UserRole, Wallet, Transaction, Session, AuditLog } from '../types'

const AVATAR_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6',
]

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa',
  'Anthony', 'Betty', 'Donald', 'Margaret', 'Sofia', 'Aiden', 'Olivia', 'Liam',
]
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
]
const DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'proton.me', 'icloud.com', 'fastmail.com']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese']
const BROWSERS = ['Chrome 127', 'Safari 17', 'Firefox 129', 'Edge 127', 'Brave 1.68', 'Opera 112']
const DEVICES = ['MacBook Pro 16"', 'iPhone 15 Pro', 'Windows Desktop', 'iPad Air', 'Pixel 8', 'ThinkPad X1']
const LOCATIONS = ['New York, US', 'London, UK', 'Berlin, DE', 'Toronto, CA', 'Sydney, AU', 'Tokyo, JP', 'Paris, FR', 'Madrid, ES']
const MERCHANTS = ['Stripe', 'AWS', 'Figma', 'Notion', 'Slack', 'GitHub', 'Linear', 'Vercel', 'Shopify', 'Uber', 'Airbnb', 'Adobe', 'Google', 'Microsoft', 'Apple']
const CATEGORIES_INCOME = ['Salary', 'Freelance', 'Dividends', 'Refund', 'Interest', 'Rental']
const CATEGORIES_EXPENSE = ['Software', 'Hosting', 'Marketing', 'Office', 'Travel', 'Meals', 'Subscriptions', 'Hardware']

// Deterministic PRNG so data is stable across reloads
let _seed = 1337
function rng() {
  _seed = (_seed * 1664525 + 1013904223) % 4294967296
  return _seed / 4294967296
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}
function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}
function daysAgo(days: number, jitter = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  if (jitter) d.setHours(d.getHours() - randInt(0, jitter))
  return d.toISOString()
}

function makeName(i: number): string {
  if (i === 0) return 'Alex Morgan'
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
}

export const users: User[] = Array.from({ length: 48 }, (_, i) => {
  const name = makeName(i)
  const role: UserRole = i === 0 ? 'admin' : i < 4 ? 'manager' : pick(['user', 'user', 'user', 'user', 'manager'] as UserRole[])
  const status: User['status'] = i < 40 ? 'active' : i < 45 ? 'suspended' : 'pending'
  return {
    id: `usr_${String(i + 1).padStart(4, '0')}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@${pick(DOMAINS)}`,
    role,
    status,
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    createdAt: daysAgo(randInt(1, 420)),
    lastActiveAt: daysAgo(randInt(0, 30), 20),
    language: pick(LANGUAGES),
    currency: pick(CURRENCIES),
    theme: pick(['light', 'light', 'dark', 'system']),
    dateFormat: pick(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
    timeFormat: pick(['12h', '24h']),
    notifications: {
      email: rng() > 0.2,
      push: rng() > 0.3,
      sms: rng() > 0.6,
      transactionAlerts: rng() > 0.25,
      securityAlerts: rng() > 0.15,
    },
  }
})

const WALLET_NAMES: Record<string, string[]> = {
  checking: ['Everyday Checking', 'Primary Checking', 'Business Checking'],
  savings: ['High-Yield Savings', 'Emergency Fund', 'Goal Savings'],
  credit: ['Sapphire Reserve', 'Platinum Card', 'Cashback Card'],
  investment: ['Brokerage Account', 'Retirement IRA', 'Index Portfolio'],
  crypto: ['Bitcoin Wallet', 'ETH Wallet', 'Crypto Vault'],
}

export const wallets: Wallet[] = users.flatMap((u, ui) => {
  const count = randInt(1, 3)
  return Array.from({ length: count }, (_, wi) => {
    const type = pick(['checking', 'savings', 'credit', 'investment', 'crypto']) as Wallet['type']
    return {
      id: `wlt_${ui}_${wi}`,
      userId: u.id,
      name: pick(WALLET_NAMES[type]),
      type,
      balance: randInt(150, 85000) + Math.round(rng() * 100) / 100,
      currency: u.currency,
      createdAt: daysAgo(randInt(1, 300)),
    }
  })
})

export const transactions: Transaction[] = users.flatMap((u, ui) => {
  const userWallets = wallets.filter((w) => w.userId === u.id)
  if (userWallets.length === 0) return []
  const count = randInt(3, 12)
  return Array.from({ length: count }, (_, ti) => {
    const type = pick(['income', 'expense', 'expense', 'expense', 'transfer']) as Transaction['type']
    const wallet = pick(userWallets)
    const isIncome = type === 'income'
    return {
      id: `txn_${ui}_${ti}`,
      userId: u.id,
      walletId: wallet.id,
      type,
      status: rng() > 0.1 ? 'completed' : pick(['pending', 'failed']) as Transaction['status'],
      amount: isIncome ? randInt(800, 9500) : randInt(12, 2400),
      currency: u.currency,
      description: isIncome
        ? `${pick(CATEGORIES_INCOME)} payment`
        : `${pick(MERCHANTS)} subscription`,
      category: isIncome ? pick(CATEGORIES_INCOME) : pick(CATEGORIES_EXPENSE),
      merchant: isIncome ? 'Bank Transfer' : pick(MERCHANTS),
      createdAt: daysAgo(randInt(0, 90), 23),
    }
  })
})

export const sessions: Session[] = users.flatMap((u, ui) => {
  const count = randInt(1, 3)
  return Array.from({ length: count }, (_, si) => ({
    id: `ses_${ui}_${si}`,
    userId: u.id,
    deviceId: pick(DEVICES),
    browser: pick(BROWSERS),
    ipAddress: `${randInt(20, 220)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
    location: pick(LOCATIONS),
    lastLoginAt: daysAgo(randInt(0, 30), 22),
    lastActiveAt: daysAgo(randInt(0, 7), 20),
    status: si === 0 && u.status === 'active' ? 'active' : pick(['active', 'expired', 'revoked']) as Session['status'],
  }))
})

const AUDIT_ACTIONS: { action: AuditLog['action']; severity: AuditLog['severity'] }[] = [
  { action: 'login', severity: 'info' },
  { action: 'logout', severity: 'info' },
  { action: 'login_failed', severity: 'warning' },
  { action: 'password_change', severity: 'info' },
  { action: 'mfa_enabled', severity: 'info' },
  { action: 'mfa_disabled', severity: 'warning' },
  { action: 'user_created', severity: 'info' },
  { action: 'user_updated', severity: 'info' },
  { action: 'user_disabled', severity: 'warning' },
  { action: 'user_deleted', severity: 'critical' },
  { action: 'wallet_created', severity: 'info' },
  { action: 'transaction_created', severity: 'info' },
  { action: 'session_revoked', severity: 'warning' },
  { action: 'role_changed', severity: 'warning' },
  { action: 'settings_updated', severity: 'info' },
]

export const auditLogs: AuditLog[] = Array.from({ length: 64 }, (_, i) => {
  const u = pick(users)
  const a = pick(AUDIT_ACTIONS)
  const entity = a.action.startsWith('user') ? 'User' : a.action.startsWith('wallet') ? 'Wallet' : a.action.startsWith('transaction') ? 'Transaction' : a.action.startsWith('session') ? 'Session' : 'Account'
  return {
    id: `aud_${String(i + 1).padStart(4, '0')}`,
    action: a.action,
    userId: u.id,
    userName: u.name,
    entity,
    entityId: `usr_${String(randInt(1, 48)).padStart(4, '0')}`,
    ipAddress: `${randInt(20, 220)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
    userAgent: `${pick(BROWSERS)} on ${pick(DEVICES)}`,
    createdAt: daysAgo(randInt(0, 45), 23),
    severity: a.severity,
  }
})

/* ---- Aggregated dashboard metrics ---- */

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id)
}
export function getWalletsByUser(id: string): Wallet[] {
  return wallets.filter((w) => w.userId === id)
}
export function getTransactionsByUser(id: string): Transaction[] {
  return transactions.filter((t) => t.userId === id)
}
export function getSessionsByUser(id: string): Session[] {
  return sessions.filter((s) => s.userId === id)
}
export function getAuditLogsByUser(id: string): AuditLog[] {
  return auditLogs.filter((a) => a.userId === id)
}

export const dashboard = {
  totalUsers: users.length,
  activeUsers: users.filter((u) => u.status === 'active').length,
  totalTransactions: transactions.length,
  totalWalletBalance: wallets.reduce((s, w) => s + w.balance, 0),
  monthlyRevenue: 184250,

  // 12-month user growth (cumulative)
  userGrowth: Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2026, i - 11, 1).toLocaleString('en-US', { month: 'short' })
    const base = Math.round(12 + i * 3.4 + Math.sin(i) * 1.5)
    return { month, users: base, active: Math.round(base * 0.72) }
  }),

  // 12-week transaction volume
  transactionVolume: Array.from({ length: 12 }, (_, i) => {
    const wk = `W${i + 1}`
    const income = Math.round(28000 + i * 1800 + Math.sin(i / 2) * 4200)
    const expense = Math.round(22000 + i * 1200 + Math.cos(i / 3) * 3800)
    return { week: wk, income, expense }
  }),

  // 6-month expense vs income
  expenseVsIncome: Array.from({ length: 6 }, (_, i) => {
    const month = new Date(2026, i - 5, 1).toLocaleString('en-US', { month: 'short' })
    return {
      month,
      income: Math.round(42000 + i * 2400 + Math.sin(i) * 3200),
      expense: Math.round(31000 + i * 1500 + Math.cos(i / 2) * 2400),
    }
  }),

  recentRegistrations: [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6),

  recentTransactions: [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 7),

  recentSecurityEvents: [...auditLogs]
    .filter((a) => a.severity !== 'info')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6),
}
