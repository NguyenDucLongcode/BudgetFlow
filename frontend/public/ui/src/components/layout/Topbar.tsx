import { useLocation } from 'react-router-dom'
import { Menu, Search, Bell, ChevronDown } from 'lucide-react'

interface TopbarProps {
  onMenu: () => void
}

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Overview', subtitle: 'Platform health and key metrics' },
  '/users': { title: 'User Management', subtitle: 'Manage accounts, roles, and access' },
  '/sessions': { title: 'Session Management', subtitle: 'Monitor and revoke active sessions' },
  '/audit': { title: 'Audit Logs', subtitle: 'Security activity and event history' },
  '/wallets': { title: 'Wallets', subtitle: 'All platform wallets and balances' },
  '/activity': { title: 'Activity', subtitle: 'Real-time platform activity' },
  '/settings': { title: 'Settings', subtitle: 'Workspace configuration' },
}

export function Topbar({ onMenu }: TopbarProps) {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  const meta = TITLES[base] ?? TITLES[pathname] ?? { title: 'FinAdmin', subtitle: '' }
  const isDetail = pathname.startsWith('/users/')

  return (
    <header className="topbar">
      <button className="topbar-menu" onClick={onMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="topbar-title">
        <h1>{isDetail ? 'User Detail' : meta.title}</h1>
        <p>{isDetail ? 'Profile, sessions, wallets and audit trail' : meta.subtitle}</p>
      </div>

      <div className="topbar-search">
        <Search size={16} />
        <input placeholder="Search users, transactions, IDs…" />
        <span className="kbd">⌘K</span>
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="topbar-icon-dot" />
        </button>
        <div className="topbar-profile">
          <div className="topbar-profile-avatar" style={{ background: '#10b981' }}>AM</div>
          <span className="topbar-profile-name">Alex Morgan</span>
          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  )
}
