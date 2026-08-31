import { Link } from 'react-router-dom'
import { Wallet, Activity, Settings as SettingsIcon, ArrowUpRight } from 'lucide-react'
import { Card } from '../components/ui/Card'

interface PlaceholderProps {
  title: string
  description: string
  icon: React.ReactNode
}

export function PlaceholderPage({ title, description, icon }: PlaceholderProps) {
  return (
    <div>
      <div className="page-head">
        <div className="page-head-title">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <Card padding="lg" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '40px 0' }}>
          <div className="stat-card-icon emerald" style={{ width: 56, height: 56 }}>{icon}</div>
          <h3 style={{ fontSize: 18 }}>{title} — coming soon</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 420, fontSize: 14 }}>
            This module is part of the FinAdmin console roadmap. Explore the live modules below.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/users"><span style={{ color: 'var(--emerald-600)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Users <ArrowUpRight size={14} /></span></Link>
            <Link to="/sessions"><span style={{ color: 'var(--emerald-600)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Sessions <ArrowUpRight size={14} /></span></Link>
            <Link to="/audit"><span style={{ color: 'var(--emerald-600)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>Audit Logs <ArrowUpRight size={14} /></span></Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function WalletsPage() {
  return <PlaceholderPage title="Wallets" description="All platform wallets and balances" icon={<Wallet size={24} />} />
}
export function ActivityPage() {
  return <PlaceholderPage title="Activity" description="Real-time platform activity feed" icon={<Activity size={24} />} />
}
export function SettingsPage() {
  return <PlaceholderPage title="Settings" description="Workspace configuration" icon={<SettingsIcon size={24} />} />
}
