import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ScrollText,
  Wallet,
  Activity,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/sessions', label: 'Sessions', icon: ShieldCheck },
  { to: '/audit', label: 'Audit Logs', icon: ScrollText },
]

const SECONDARY = [
  { to: '/wallets', label: 'Wallets', icon: Wallet },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={cn('sidebar', open && 'sidebar-open')}>
        <div className="sidebar-head">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-name">FinAdmin</span>
              <span className="sidebar-logo-sub">Ops Console</span>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-label">Operations</p>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <p className="sidebar-label">System</p>
          {SECONDARY.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar" style={{ background: '#10b981' }}>AM</div>
            <div className="sidebar-user-text">
              <span className="sidebar-user-name">Alex Morgan</span>
              <span className="sidebar-user-role">Super Admin</span>
            </div>
            <button className="sidebar-user-logout" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
