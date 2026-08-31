import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { OverviewPage } from './pages/OverviewPage'
import { UsersPage } from './pages/UsersPage'
import { UserDetailPage } from './pages/UserDetailPage'
import { SessionsPage } from './pages/SessionsPage'
import { AuditPage } from './pages/AuditPage'
import { WalletsPage, ActivityPage, SettingsPage } from './pages/PlaceholderPages'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<OverviewPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="wallets" element={<WalletsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
