import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Eye, Ban, Trash2, MoreHorizontal, ChevronLeft, ChevronRight,
  Users as UsersIcon, UserCheck, UserX, Shield, Download,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { users as allUsers } from '../data/mock'
import { cn, formatDate, timeAgo } from '../lib/utils'
import type { User, UserRole, UserStatus } from '../types'
import '../components/ui/widgets.css'

const ROLE_VARIANT: Record<UserRole, 'info' | 'success' | 'neutral'> = {
  admin: 'info',
  manager: 'success',
  user: 'neutral',
}
const STATUS_VARIANT: Record<UserStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  suspended: 'warning',
  pending: 'neutral',
}

function RowActions({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="row-actions">
      <button
        className="row-actions-trigger"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-label="Actions"
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="row-actions-menu" onMouseDown={(e) => e.preventDefault()}>
          <Link to={`/users/${user.id}`} className="row-actions-item">
            <Eye size={15} /> View detail
          </Link>
          <button className="row-actions-item warn">
            <Ban size={15} /> Disable account
          </button>
          <button className="row-actions-item danger">
            <Trash2 size={15} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

export function UsersPage() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<'all' | UserRole>('all')
  const [status, setStatus] = useState<'all' | UserStatus>('all')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = useMemo(() => {
    return allUsers.filter((u) => {
      if (query) {
        const q = query.toLowerCase()
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.id.toLowerCase().includes(q)) return false
      }
      if (role !== 'all' && u.role !== role) return false
      if (status !== 'all' && u.status !== status) return false
      return true
    })
  }, [query, role, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const current = Math.min(page, totalPages)
  const pageItems = filtered.slice((current - 1) * perPage, current * perPage)

  const counts = {
    total: allUsers.length,
    active: allUsers.filter((u) => u.status === 'active').length,
    suspended: allUsers.filter((u) => u.status === 'suspended').length,
    admins: allUsers.filter((u) => u.role === 'admin').length,
  }

  function reset() {
    setQuery(''); setRole('all'); setStatus('all'); setPage(1)
  }

  return (
    <div>
      <div className="page-head">
        <div className="page-head-title">
          <h2>User Management</h2>
          <p>Search, filter, and manage all platform accounts.</p>
        </div>
        <div className="page-head-actions">
          <Button variant="outline" size="md" icon={<Download size={16} />}>Export CSV</Button>
          <Button variant="primary" size="md" icon={<UsersIcon size={16} />}>Add User</Button>
        </div>
      </div>

      {/* Mini summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 18 }}>
        {[
          { label: 'Total Users', value: counts.total, icon: UsersIcon, color: 'emerald' },
          { label: 'Active', value: counts.active, icon: UserCheck, color: 'blue' },
          { label: 'Suspended', value: counts.suspended, icon: UserX, color: 'amber' },
          { label: 'Admins', value: counts.admins, icon: Shield, color: 'slate' },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ paddingTop: 16, paddingBottom: 16 }}>
            <div className="stat-card-top" style={{ marginBottom: 8 }}>
              <div className={`stat-card-icon ${s.color}`} style={{ width: 34, height: 34 }}>
                <s.icon />
              </div>
            </div>
            <div className="stat-card-value" style={{ fontSize: 22 }}>{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <Card padding="none">
        {/* Filters */}
        <div className="filters-bar">
          <div className="input-wrap">
            <span className="input-icon-left"><Search size={16} /></span>
            <input
              className="input input-with-icon"
              placeholder="Search by name, email, or ID…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            />
          </div>
          <select className="select" value={role} onChange={(e) => { setRole(e.target.value as typeof role); setPage(1) }}>
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
          <select className="select" value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1) }}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          <Button variant="ghost" size="md" onClick={reset}>Reset</Button>
        </div>

        {/* Table */}
        {pageItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><UserX size={22} /></div>
            <p style={{ fontWeight: 600, color: 'var(--text)' }}>No users found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <Link to={`/users/${u.id}`} className="user-cell">
                        <Avatar name={u.name} color={u.avatarColor} size={34} />
                        <div className="user-cell-text">
                          <span className="user-cell-name">{u.name}</span>
                          <span className="user-cell-id">{u.id}</span>
                        </div>
                      </Link>
                    </td>
                    <td><span className="cell-email">{u.email}</span></td>
                    <td><Badge variant={ROLE_VARIANT[u.role]} size="sm">{u.role}</Badge></td>
                    <td><Badge variant={STATUS_VARIANT[u.status]} size="sm" dot>{u.status}</Badge></td>
                    <td><span className="cell-date">{formatDate(u.createdAt)}</span><span className="cell-date-sub">{timeAgo(u.createdAt)}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <Link to={`/users/${u.id}`}>
                          <Button variant="ghost" size="sm" icon={<Eye size={15} />}>View</Button>
                        </Link>
                        <RowActions user={u} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="pagination">
          <span className="pagination-info">
            Showing <strong>{pageItems.length === 0 ? 0 : (current - 1) * perPage + 1}–{(current - 1) * perPage + pageItems.length}</strong> of <strong>{filtered.length}</strong> users
          </span>
          <div className="pagination-controls">
            <button className="page-btn" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - current) <= 1)
              .map((p, i, arr) => (
                <span key={p} style={{ display: 'flex', gap: 4 }}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="page-ellipsis">…</span>}
                  <button className={cn('page-btn', p === current && 'active')} onClick={() => setPage(p)}>{p}</button>
                </span>
              ))}
            <button className="page-btn" disabled={current === totalPages} onClick={() => setPage(current + 1)} aria-label="Next">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
