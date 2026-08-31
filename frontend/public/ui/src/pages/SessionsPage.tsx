import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, ShieldCheck, Monitor, Smartphone, Tablet, Globe,
  Ban, LogOut, ChevronLeft, ChevronRight, ShieldAlert, Activity,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { sessions as allSessions, users } from '../data/mock'
import { cn, formatDateTime, timeAgo } from '../lib/utils'
import type { Session } from '../types'
import '../components/ui/widgets.css'
import '../components/ui/tables.css'

function deviceIcon(deviceId: string) {
  if (/iphone|pixel|mobile/i.test(deviceId)) return Smartphone
  if (/ipad|tablet/i.test(deviceId)) return Tablet
  return Monitor
}

const STATUS_VARIANT = {
  active: 'success',
  expired: 'neutral',
  revoked: 'danger',
} as const

export function SessionsPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | Session['status']>('all')
  const [page, setPage] = useState(1)
  const perPage = 10

  const enriched = useMemo(
    () =>
      allSessions.map((s) => ({
        ...s,
        user: users.find((u) => u.id === s.userId),
      })),
    [],
  )

  const filtered = useMemo(() => {
    return enriched.filter((s) => {
      if (status !== 'all' && s.status !== status) return false
      if (query) {
        const q = query.toLowerCase()
        const u = s.user
        if (
          !s.deviceId.toLowerCase().includes(q) &&
          !s.browser.toLowerCase().includes(q) &&
          !s.ipAddress.includes(q) &&
          !(u && (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)))
        ) return false
      }
      return true
    })
  }, [enriched, query, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const current = Math.min(page, totalPages)
  const pageItems = filtered.slice((current - 1) * perPage, current * perPage)

  const counts = {
    total: allSessions.length,
    active: allSessions.filter((s) => s.status === 'active').length,
    revoked: allSessions.filter((s) => s.status === 'revoked').length,
  }

  return (
    <div>
      <div className="page-head">
        <div className="page-head-title">
          <h2>Session Management</h2>
          <p>Monitor active sessions and revoke access when needed.</p>
        </div>
        <div className="page-head-actions">
          <Button variant="outline" size="md" icon={<ShieldAlert size={16} />}>Revoke All</Button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 18 }}>
        {[
          { label: 'Total Sessions', value: counts.total, icon: Activity, color: 'emerald' },
          { label: 'Active Now', value: counts.active, icon: ShieldCheck, color: 'blue' },
          { label: 'Revoked', value: counts.revoked, icon: Ban, color: 'red' },
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
              placeholder="Search by user, device, IP…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            />
          </div>
          <select className="select" value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1) }}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        {pageItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ShieldCheck size={22} /></div>
            <p style={{ fontWeight: 600 }}>No sessions found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Try a different search or filter.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>IP Address</th>
                  <th>Location</th>
                  <th>Last Login</th>
                  <th>Last Active</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((s) => {
                  const Icon = deviceIcon(s.deviceId)
                  return (
                    <tr key={s.id}>
                      <td>
                        <Link to={`/users/${s.userId}`} className="user-cell">
                          <Avatar name={s.user?.name ?? '?'} color={s.user?.avatarColor ?? '#94a3b8'} size={32} />
                          <div className="user-cell-text">
                            <span className="user-cell-name">{s.user?.name ?? 'Unknown'}</span>
                            <span className="user-cell-id">{s.user?.email}</span>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <span className="device-cell">
                          <Icon size={15} /> {s.deviceId}
                        </span>
                      </td>
                      <td><span className="cell-mono">{s.browser}</span></td>
                      <td><span className="cell-mono">{s.ipAddress}</span></td>
                      <td><span className="cell-location"><Globe size={13} /> {s.location}</span></td>
                      <td><span className="cell-date">{formatDateTime(s.lastLoginAt)}</span></td>
                      <td>
                        <Badge variant={STATUS_VARIANT[s.status]} size="sm" dot>{s.status}</Badge>
                        <span className="cell-date-sub" style={{ marginTop: 4 }}>{timeAgo(s.lastActiveAt)}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <Button variant="danger" size="sm" icon={<Ban size={14} />} disabled={s.status !== 'active'}>Revoke</Button>
                          <Button variant="ghost" size="sm" icon={<LogOut size={14} />} disabled={s.status !== 'active'}>Force logout</Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <span className="pagination-info">
            Showing <strong>{pageItems.length === 0 ? 0 : (current - 1) * perPage + 1}–{(current - 1) * perPage + pageItems.length}</strong> of <strong>{filtered.length}</strong> sessions
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
