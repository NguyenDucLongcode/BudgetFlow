import { useMemo, useState } from 'react'
import {
  Search, ScrollText, ShieldAlert, ShieldCheck, AlertTriangle,
  ChevronLeft, ChevronRight, Calendar,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { auditLogs as allLogs } from '../data/mock'
import { cn, formatDateTime } from '../lib/utils'
import type { AuditAction, AuditLog } from '../types'
import '../components/ui/widgets.css'
import '../components/ui/tables.css'

const SEVERITY_VARIANT = {
  info: 'info',
  warning: 'warning',
  critical: 'danger',
} as const

const ACTION_LABELS: Record<AuditAction, string> = {
  login: 'Login',
  logout: 'Logout',
  login_failed: 'Login Failed',
  password_change: 'Password Changed',
  mfa_enabled: 'MFA Enabled',
  mfa_disabled: 'MFA Disabled',
  user_created: 'User Created',
  user_updated: 'User Updated',
  user_deleted: 'User Deleted',
  user_disabled: 'User Disabled',
  wallet_created: 'Wallet Created',
  wallet_deleted: 'Wallet Deleted',
  transaction_created: 'Transaction Created',
  session_revoked: 'Session Revoked',
  role_changed: 'Role Changed',
  settings_updated: 'Settings Updated',
}

export function AuditPage() {
  const [query, setQuery] = useState('')
  const [action, setAction] = useState<'all' | AuditAction>('all')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 12

  const filtered = useMemo(() => {
    return allLogs.filter((l) => {
      if (action !== 'all' && l.action !== action) return false
      if (query) {
        const q = query.toLowerCase()
        if (
          !l.userName.toLowerCase().includes(q) &&
          !l.action.toLowerCase().includes(q) &&
          !l.ipAddress.includes(q) &&
          !l.entityId.toLowerCase().includes(q)
        ) return false
      }
      if (date) {
        const d = new Date(date).toDateString()
        if (new Date(l.createdAt).toDateString() !== d) return false
      }
      return true
    })
  }, [query, action, date])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const current = Math.min(page, totalPages)
  const pageItems = filtered.slice((current - 1) * perPage, current * perPage)

  const counts = {
    total: allLogs.length,
    warnings: allLogs.filter((l) => l.severity === 'warning').length,
    critical: allLogs.filter((l) => l.severity === 'critical').length,
  }

  return (
    <div>
      <div className="page-head">
        <div className="page-head-title">
          <h2>Audit Logs</h2>
          <p>Security activity and immutable event history.</p>
        </div>
        <div className="page-head-actions">
          <Button variant="outline" size="md" icon={<Calendar size={16} />}>Date range</Button>
          <Button variant="primary" size="md" icon={<ScrollText size={16} />}>Export</Button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 18 }}>
        {[
          { label: 'Total Events', value: counts.total, icon: ScrollText, color: 'emerald' },
          { label: 'Warnings', value: counts.warnings, icon: AlertTriangle, color: 'amber' },
          { label: 'Critical', value: counts.critical, icon: ShieldAlert, color: 'red' },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ paddingTop: 16, paddingBottom: 16 }}>
            <div className="stat-card-top" style={{ marginBottom: 8 }}>
              <div className={`stat-card-icon ${s.color}`} style={{ width: 34, height: 34 }}><s.icon /></div>
            </div>
            <div className="stat-card-value" style={{ fontSize: 22 }}>{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <Card padding="none">
        <div className="filters-bar">
          <div className="input-wrap">
            <span className="input-icon-left"><Search size={16} /></span>
            <input
              className="input input-with-icon"
              placeholder="Search by user, action, IP, entity ID…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            />
          </div>
          <select className="select" value={action} onChange={(e) => { setAction(e.target.value as typeof action); setPage(1) }}>
            <option value="all">All actions</option>
            {(Object.keys(ACTION_LABELS) as AuditAction[]).map((a) => (
              <option key={a} value={a}>{ACTION_LABELS[a]}</option>
            ))}
          </select>
          <div className="input-wrap" style={{ minWidth: 180, maxWidth: 200 }}>
            <span className="input-icon-left"><Calendar size={16} /></span>
            <input
              type="date"
              className="input input-with-icon"
              value={date}
              onChange={(e) => { setDate(e.target.value); setPage(1) }}
            />
          </div>
        </div>

        {pageItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ShieldCheck size={22} /></div>
            <p style={{ fontWeight: 600 }}>No log entries found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Adjust your filters to see events.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>IP Address</th>
                  <th>User Agent</th>
                  <th>Severity</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((l: AuditLog) => (
                  <tr key={l.id}>
                    <td>
                      <span className="audit-action">
                        <span className={`audit-action-dot sev-${l.severity}`} />
                        {ACTION_LABELS[l.action]}
                      </span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <Avatar name={l.userName} size={28} color="#475569" />
                        <span className="user-cell-name" style={{ fontSize: 13 }}>{l.userName}</span>
                      </div>
                    </td>
                    <td><Badge variant="neutral" size="sm">{l.entity}</Badge></td>
                    <td><span className="cell-mono">{l.entityId}</span></td>
                    <td><span className="cell-mono">{l.ipAddress}</span></td>
                    <td><span className="cell-ua">{l.userAgent}</span></td>
                    <td><Badge variant={SEVERITY_VARIANT[l.severity]} size="sm" dot>{l.severity}</Badge></td>
                    <td><span className="cell-date">{formatDateTime(l.createdAt)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <span className="pagination-info">
            Showing <strong>{pageItems.length === 0 ? 0 : (current - 1) * perPage + 1}–{(current - 1) * perPage + pageItems.length}</strong> of <strong>{filtered.length}</strong> events
          </span>
          <div className="pagination-controls">
            <button className="page-btn" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft size={16} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - current) <= 1)
              .map((p, i, arr) => (
                <span key={p} style={{ display: 'flex', gap: 4 }}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="page-ellipsis">…</span>}
                  <button className={cn('page-btn', p === current && 'active')} onClick={() => setPage(p)}>{p}</button>
                </span>
              ))}
            <button className="page-btn" disabled={current === totalPages} onClick={() => setPage(current + 1)}><ChevronRight size={16} /></button>
          </div>
        </div>
      </Card>
    </div>
  )
}
