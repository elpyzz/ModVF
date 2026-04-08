import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { AppLayout } from './components/layout/AppLayout'
import { PageShell } from './components/layout/PageShell'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Toast } from './components/ui/Toast'
import CGVPage from './pages/CGVPage'
import ConfidentialitePage from './pages/ConfidentialitePage'
import DashboardPage from './pages/DashboardPage'
import FAQPage from './pages/FAQPage'
import GuidePage from './pages/GuidePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MentionsLegalesPage from './pages/MentionsLegalesPage'
import PricingPage from './pages/PricingPage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import { useTokenRefresh } from './hooks/useTokenRefresh'
import { useAuthStore } from './stores/useAuthStore'

function RedirectTarifs() {
  const { search, hash } = useLocation()
  return <Navigate to={`/tarifs${search}${hash}`} replace />
}

function App() {
  useTokenRefresh()
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    const url = new URL(window.location.href)
    const ref = url.searchParams.get('ref')
    if (ref) {
      window.localStorage.setItem('modvf_ref', ref.trim().toUpperCase())
      url.searchParams.delete('ref')
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    }
  }, [])

  useEffect(() => {
    void initialize()
  }, [initialize])

  return (
    <AppLayout>
      <Routes>
        <Route element={<PageShell />}>
          <Route index element={<HomePage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="tarifs" element={<PricingPage />} />
          <Route path="pricing" element={<RedirectTarifs />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="account" element={<Navigate to="/settings" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="mentions-legales" element={<MentionsLegalesPage />} />
          <Route path="cgv" element={<CGVPage />} />
          <Route path="confidentialite" element={<ConfidentialitePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
      <Analytics />
    </AppLayout>
  )
}

export default App
