import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Mail, Shield, Calendar, Globe, Coins, Palette, Clock,
  Monitor, Smartphone, Wallet as WalletIcon, ArrowUpRight,
  ArrowDownRight, ArrowLeftRight, Smartphone as PhoneIcon, LogOut,
  Ban, Trash2, MoreVertical, Check, X,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import {
  getUserById, getWalletsByUser, getTransactionsByUser,
  getSessionsByUser, getAuditLogsByUser,
} from '../data/mock'
import { cn, formatCurrency, formatDate, formatDateTime, timeAgo } from '../lib/utils'
import type { Transaction } from '../types'
import '../components/ui/widgets.css'
import '../components/ui/tables.css'
import './UserDetailPage.css'

const ROLE_VARIANT = { admin: 'info', manager: 'success', user: 'neutral' } as const
const STATUS_VARIANT = { active: 'success', suspended: 'warning', pending: 'neutral' } as const

function PrefRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="pref-row">
      <span className="pref-icon">{icon}</span>
      <span className="pref-label">{label}</span>
      <span className="pref-value">{value}</span>
    </div>
  )
}

function NotifToggle({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="notif-row">
      <span className="notif-label">{label}</span>
      <span className={cn('notif-toggle', on && 'on')}>
        {on ? <Check size={12} /> : <X size={12} />}
      </span>
    </div>
  )
}

function deviceIcon(name: string) {
  if (/iphone|pixel|mobile/i.test(name)) return Smartphone
  if (/ipad|tablet/i.test(name)) return Monitor
  return PhoneIcon
}

const WALLET_TYPE_COLOR: Record<string, string> = {
  checking: '#10b981',
  savings: '#3b82f6',
  credit: '#f59e0b',
  investment: '#8b5cf6',
  crypto: '#06b6d4',
}

export function UserDetailPage() {
  const { id } = useParams()
  const user = id ? getUserById(id) : undefined

  if (!user) {
    return (
      <div className="empty-state" style={{ minHeight: 320 }}>
        <div className="empty-state-icon"><X size={22} /></div>
        <p style={{ fontWeight: 600 }}>User not found</p>
        <Link to="/users" style={{ marginTop: 12 }}><Button variant="outline" size="md">Back to users</Button></Link>
      </div>
    )
  }

  const userWallets = getWalletsByUser(user.id)
  const userTxns = getTransactionsByUser(user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
  const userSessions = getSessionsByUser(user.id)
  const userAudit = getAuditLogsByUser(user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 7)

  // synthetic 6-month balance trend for the user
  const balanceTrend = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(2026, i - 5, 1).toLocaleString('en-US', { month: 'short' })
    return { month, balance: Math.round(userWallets.reduce((s, w) => s + w.balance, 0) * (0.7 + i * 0.06)) }
  })

  const totalBalance = userWallets.reduce((s, w) => s + w.balance, 0)

  return (
    <div className="ud">
      <Link to="/users" className="ud-back">
        <ArrowLeft size={16} /> Back to users
      </Link>

      {/* Profile header */}
      <Card padding="none" className="ud-profile-card">
        <div className="ud-profile-banner" />
        <div className="ud-profile-body">
          <Avatar name={user.name} color={user.avatarColor} size={80} className="ud-profile-avatar" />
          <div className="ud-profile-info">
            <div className="ud-profile-name-row">
              <h2>{user.name}</h2>
              <Badge variant={STATUS_VARIANT[user.status]} dot>{user.status}</Badge>
              <Badge variant={ROLE_VARIANT[user.role]}>{user.role}</Badge>
            </div>
            <div className="ud-profile-meta">
              <span><Mail size={14} /> {user.email}</span>
              <span><Shield size={14} /> {user.id}</span>
              <span><Calendar size={14} /> Joined {formatDate(user.createdAt)}</span>
              <span><Clock size={14} /> Active {timeAgo(user.lastActiveAt)}</span>
            </div>
          </div>
          <div className="ud-profile-actions">
            <Button variant="outline" size="md" icon={<MoreVertical size={16} />}>Edit</Button>
            <Button variant="danger" size="md" icon={<Ban size={16} />}>Disable</Button>
            <Button variant="ghost" size="md" icon={<Trash2 size={16} />}>Delete</Button>
          </div>
        </div>
      </Card>

      <div className="ud-grid">
        {/* LEFT: profile + prefs */}
        <div className="ud-col">
          <Card padding="none">
            <CardHeader title="User Profile" subtitle="Account information" />
            <div className="ud-section">
              <div className="ud-profile-rows">
                <div className="ud-info-row"><span>Full Name</span><strong>{user.name}</strong></div>
                <div className="ud-info-row"><span>Email</span><strong>{user.email}</strong></div>
                <div className="ud-info-row"><span>Role</span><strong style={{ textTransform: 'capitalize' }}>{user.role}</strong></div>
                <div className="ud-info-row"><span>Status</span><strong style={{ textTransform: 'capitalize' }}>{user.status}</strong></div>
                <div className="ud-info-row"><span>User ID</span><strong className="cell-mono">{user.id}</strong></div>
                <div className="ud-info-row"><span>Created</span><strong>{formatDate(user.createdAt)}</strong></div>
              </div>
            </div>
          </Card>

          <Card padding="none">
            <CardHeader title="User Preferences" subtitle="Localization and display settings" />
            <div className="ud-section">
              <PrefRow icon={<Globe size={15} />} label="Language" value={user.language} />
              <PrefRow icon={<Coins size={15} />} label="Currency" value={user.currency} />
              <PrefRow icon={<Palette size={15} />} label="Theme" value={user.theme} />
              <PrefRow icon={<Calendar size={15} />} label="Date Format" value={user.dateFormat} />
              <PrefRow icon={<Clock size={15} />} label="Time Format" value={user.timeFormat} />
            </div>
          </Card>

          <Card padding="none">
            <CardHeader title="Notification Settings" subtitle="Communication preferences" />
            <div className="ud-section">
              <NotifToggle label="Email notifications" on={user.notifications.email} />
              <NotifToggle label="Push notifications" on={user.notifications.push} />
              <NotifToggle label="SMS alerts" on={user.notifications.sms} />
              <NotifToggle label="Transaction alerts" on={user.notifications.transactionAlerts} />
              <NotifToggle label="Security alerts" on={user.notifications.securityAlerts} />
            </div>
          </Card>
        </div>

        {/* RIGHT: sessions, wallets, txns, audit */}
        <div className="ud-col">
          {/* Sessions */}
          <Card padding="none">
            <CardHeader
              title="Sessions"
              subtitle="Active devices and login history"
              action={<Button variant="ghost" size="sm" icon={<LogOut size={14} />}>Revoke all</Button>}
            />
            <div className="ud-session-list">
              {userSessions.length === 0 && <p className="ud-empty">No active sessions.</p>}
              {userSessions.map((s) => {
                const Icon = deviceIcon(s.deviceId)
                return (
                  <div key={s.id} className="ud-session-item">
                    <div className="ud-session-icon"><Icon size={16} /></div>
                    <div className="ud-session-body">
                      <div className="ud-session-top">
                        <span className="ud-session-device">{s.deviceId}</span>
                        <Badge variant={s.status === 'active' ? 'success' : s.status === 'revoked' ? 'danger' : 'neutral'} size="sm">{s.status}</Badge>
                      </div>
                      <div className="ud-session-meta">
                        <span>{s.browser}</span>
                        <span className="cell-mono">{s.ipAddress}</span>
                        <span>{s.location}</span>
                      </div>
                      <div className="ud-session-times">
                        Login {formatDateTime(s.lastLoginAt)} · Active {timeAgo(s.lastActiveAt)}
                      </div>
                    </div>
                    <Button variant="danger" size="sm" icon={<Ban size={13} />} disabled={s.status !== 'active'}>Revoke</Button>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Wallets */}
          <Card padding="none">
            <CardHeader
              title="Wallets"
              subtitle={`${userWallets.length} wallets · ${formatCurrency(totalBalance, user.currency)} total`}
            />
            <div className="ud-wallet-list">
              {userWallets.length === 0 && <p className="ud-empty">No wallets.</p>}
              {userWallets.map((w) => (
                <div key={w.id} className="ud-wallet-item">
                  <div className="ud-wallet-icon" style={{ background: `${WALLET_TYPE_COLOR[w.type]}18`, color: WALLET_TYPE_COLOR[w.type] }}>
                    <WalletIcon size={16} />
                  </div>
                  <div className="ud-wallet-body">
                    <div className="ud-wallet-name">{w.name}</div>
                    <div className="ud-wallet-type">{w.type}</div>
                  </div>
                  <div className="ud-wallet-balance">{formatCurrency(w.balance, w.currency)}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Balance trend mini chart */}
          <Card padding="none">
            <CardHeader title="Balance Trend" subtitle="Last 6 months" />
            <div style={{ padding: '16px 12px 8px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={balanceTrend} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, color: '#fff', fontSize: 13 }}
                    formatter={(v: number) => [formatCurrency(v, user.currency), 'Balance']}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2.5} fill="url(#gBal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Transactions table — full width */}
      <Card padding="none" style={{ marginBottom: 22 }}>
        <CardHeader title="Recent Transactions" subtitle="Latest activity across all wallets" />
        {userTxns.length === 0 ? (
          <p className="ud-empty" style={{ padding: 24 }}>No transactions.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Merchant</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {userTxns.map((t: Transaction) => (
                  <tr key={t.id}>
                    <td><span style={{ fontWeight: 600 }}>{t.description}</span></td>
                    <td><Badge variant="neutral" size="sm">{t.category}</Badge></td>
                    <td><span className="cell-mono">{t.merchant}</span></td>
                    <td>
                      <span className="ud-txn-type">
                        {t.type === 'income' ? <ArrowUpRight size={14} /> : t.type === 'expense' ? <ArrowDownRight size={14} /> : <ArrowLeftRight size={14} />}
                        {t.type}
                      </span>
                    </td>
                    <td>
                      <Badge
                        variant={t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td><span className="cell-date">{formatDate(t.createdAt)}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <strong className={cn('ud-txn-amount', t.type)}>
                        {t.type === 'income' ? '+' : t.type === 'expense' ? '−' : ''}{formatCurrency(t.amount, t.currency)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Audit timeline — full width */}
      <Card padding="none">
        <CardHeader title="Audit Logs" subtitle="Security activity timeline for this user" />
        <div className="ud-timeline">
          {userAudit.length === 0 && <p className="ud-empty" style={{ padding: 24 }}>No audit events.</p>}
          {userAudit.map((e) => (
            <div key={e.id} className="ud-timeline-item">
              <div className={cn('ud-timeline-dot', `sev-${e.severity}`)} />
              <div className="ud-timeline-content">
                <div className="ud-timeline-top">
                  <span className="ud-timeline-action">{e.action.replace(/_/g, ' ')}</span>
                  <Badge variant={e.severity === 'critical' ? 'danger' : e.severity === 'warning' ? 'warning' : 'info'} size="sm">{e.severity}</Badge>
                </div>
                <div className="ud-timeline-meta">
                  <span className="cell-mono">{e.ipAddress}</span>
                  <span>·</span>
                  <span>{e.entity} {e.entityId}</span>
                  <span>·</span>
                  <span>{formatDateTime(e.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
