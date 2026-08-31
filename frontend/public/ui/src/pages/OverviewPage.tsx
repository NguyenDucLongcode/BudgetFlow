import {
  Users, UserCheck, ArrowLeftRight, Wallet, TrendingUp,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
} from 'recharts'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { dashboard } from '../data/mock'
import { formatCurrency, formatNumber, timeAgo } from '../lib/utils'
import '../components/ui/widgets.css'

const chartTheme = {
  emerald: '#10b981',
  emeraldFill: '#10b981',
  blue: '#3b82f6',
  red: '#ef4444',
  slate: '#cbd5e1',
  axis: '#94a3b8',
  grid: '#f1f5f9',
}

function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="chart-tooltip-item">
          <span className="chart-tooltip-dot" style={{ background: p.color || p.fill }} />
          <span>{p.name}</span>
          <strong>{formatter ? formatter(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export function OverviewPage() {
  const stats = [
    {
      label: 'Total Users', value: formatNumber(dashboard.totalUsers), icon: Users,
      color: 'emerald' as const, trend: '+12.4%', up: true,
    },
    {
      label: 'Active Users', value: formatNumber(dashboard.activeUsers), icon: UserCheck,
      color: 'blue' as const, trend: '+8.1%', up: true,
    },
    {
      label: 'Total Transactions', value: formatNumber(dashboard.totalTransactions), icon: ArrowLeftRight,
      color: 'amber' as const, trend: '+23.7%', up: true,
    },
    {
      label: 'Total Wallet Balance', value: formatCurrency(dashboard.totalWalletBalance, 'USD', true), icon: Wallet,
      color: 'slate' as const, trend: '+5.3%', up: true,
    },
    {
      label: 'Monthly Revenue', value: formatCurrency(dashboard.monthlyRevenue, 'USD', true), icon: TrendingUp,
      color: 'red' as const, trend: '-2.1%', up: false, placeholder: true,
    },
  ]

  return (
    <div>
      <div className="page-head">
        <div className="page-head-title">
          <h2>Operations Overview</h2>
          <p>Real-time snapshot of platform health and key performance metrics.</p>
        </div>
        <div className="page-head-actions">
          <Button variant="outline" size="md">Last 30 days</Button>
          <Button variant="primary" size="md" icon={<TrendingUp size={16} />}>Export Report</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-top">
              <div className={`stat-card-icon ${s.color}`}>
                <s.icon />
              </div>
              <span className={`stat-card-trend ${s.up ? 'up' : 'down'}`}>
                {s.up ? <ArrowUpRight /> : <ArrowDownRight />}
                {s.trend}
              </span>
            </div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">
              {s.label}
              {s.placeholder && <span className="stat-placeholder-tag"> · placeholder</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1: user growth + transaction volume */}
      <div className="dash-grid">
        <Card padding="none">
          <CardHeader
            title="User Growth"
            subtitle="Cumulative sign-ups vs. active users (last 12 months)"
            action={
              <div className="chart-legend">
                <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: chartTheme.emerald }} />Total</span>
                <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: chartTheme.blue }} />Active</span>
              </div>
            }
          />
          <div style={{ padding: '20px 12px 8px' }}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dashboard.userGrowth} margin={{ top: 6, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartTheme.emerald} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={chartTheme.emerald} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartTheme.blue} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={chartTheme.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: chartTheme.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: chartTheme.axis }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip formatter={(v: number) => `${v} users`} />} />
                <Area type="monotone" dataKey="users" name="Total" stroke={chartTheme.emerald} strokeWidth={2.5} fill="url(#gUsers)" />
                <Area type="monotone" dataKey="active" name="Active" stroke={chartTheme.blue} strokeWidth={2.5} fill="url(#gActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="none">
          <CardHeader title="Transaction Volume" subtitle="Income vs. expense flow (12 weeks)" />
          <div style={{ padding: '20px 12px 8px' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dashboard.transactionVolume} margin={{ top: 6, right: 20, left: -10, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: chartTheme.axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: chartTheme.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip cursor={{ fill: 'rgba(15,23,42,0.04)' }} content={<ChartTooltip formatter={(v: number) => formatCurrency(v, 'USD', true)} />} />
                <Bar dataKey="income" name="Income" fill={chartTheme.emerald} radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="expense" name="Expense" fill={chartTheme.red} radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Expense vs Income chart (full) */}
      <Card padding="none" style={{ marginBottom: 22 }}>
        <CardHeader
          title="Expense vs. Income"
          subtitle="Monthly comparison over the last 6 months"
          action={
            <div className="chart-legend">
              <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: chartTheme.emerald }} />Income</span>
              <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: chartTheme.red }} />Expense</span>
            </div>
          }
        />
        <div style={{ padding: '20px 12px 12px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboard.expenseVsIncome} margin={{ top: 6, right: 24, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: chartTheme.axis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: chartTheme.axis }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip content={<ChartTooltip formatter={(v: number) => formatCurrency(v, 'USD', true)} />} />
              <Line type="monotone" dataKey="income" name="Income" stroke={chartTheme.emerald} strokeWidth={3} dot={{ r: 4, fill: chartTheme.emerald }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expense" name="Expense" stroke={chartTheme.red} strokeWidth={3} dot={{ r: 4, fill: chartTheme.red }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent activity: 3 columns */}
      <div className="dash-row">
        <Card padding="none">
          <CardHeader title="New Registrations" subtitle="Latest user sign-ups" />
          <div className="activity-list">
            {dashboard.recentRegistrations.map((u) => (
              <Link to={`/users/${u.id}`} key={u.id} className="activity-item">
                <Avatar name={u.name} color={u.avatarColor} size={36} />
                <div className="activity-body">
                  <div className="activity-title">{u.name}</div>
                  <div className="activity-sub">{u.email}</div>
                </div>
                <div className="activity-meta">
                  <div className="activity-time">{timeAgo(u.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/users" className="activity-link">
            View all users <ArrowUpRight size={14} />
          </Link>
        </Card>

        <Card padding="none">
          <CardHeader title="Latest Transactions" subtitle="Most recent platform activity" />
          <div className="activity-list">
            {dashboard.recentTransactions.map((t) => {
              const u = dashboard.recentRegistrations.find((r) => r.id === t.userId)
              return (
                <div className="activity-item" key={t.id}>
                  <div className={`activity-icon ${t.type}`}>
                    {t.type === 'income' ? <ArrowUpRight /> : t.type === 'expense' ? <ArrowDownRight /> : <ArrowLeftRight />}
                  </div>
                  <div className="activity-body">
                    <div className="activity-title">{t.description}</div>
                    <div className="activity-sub">{u?.name ?? 'System'} · {t.category}</div>
                  </div>
                  <div className="activity-meta">
                    <div className={`activity-amount ${t.type}`}>
                      {t.type === 'income' ? '+' : t.type === 'expense' ? '−' : ''}{formatCurrency(t.amount, t.currency)}
                    </div>
                    <div className="activity-time">{timeAgo(t.createdAt)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card padding="none">
          <CardHeader title="Security Events" subtitle="Recent security activity" />
          <div className="activity-list">
            {dashboard.recentSecurityEvents.map((e) => (
              <div className="activity-item" key={e.id}>
                <div className={`activity-icon security`}>
                  <TrendingUp />
                </div>
                <div className="activity-body">
                  <div className="activity-title">{e.action.replace(/_/g, ' ')}</div>
                  <div className="activity-sub">{e.userName} · {e.ipAddress}</div>
                </div>
                <div className="activity-meta">
                  <Badge variant={e.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                    {e.severity}
                  </Badge>
                  <div className="activity-time" style={{ marginTop: 4 }}>{timeAgo(e.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/audit" className="activity-link">
            View audit logs <ArrowUpRight size={14} />
          </Link>
        </Card>
      </div>
    </div>
  )
}
