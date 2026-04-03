import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { PageShell } from './components/layout/PageShell'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Toast } from './components/ui/Toast'
import CGVPage from './pages/CGVPage'
import ConfidentialitePage from './pages/ConfidentialitePage'
import DashboardPage from './pages/DashboardPage'
import GuidePage from './pages/GuidePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MentionsLegalesPage from './pages/MentionsLegalesPage'
import PricingPage from './pages/PricingPage'
import RegisterPage from './pages/RegisterPage'
import { useAuthStore } from './stores/useAuthStore'

function RedirectTarifs() {
  const { search, hash } = useLocation()
  return <Navigate to={`/tarifs${search}${hash}`} replace />
}

function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    void initialize()
  }, [initialize])

  return (
    <AppLayout>
      <Routes>
        <Route element={<PageShell />}>
          <Route index element={<HomePage />} />
          <Route path="guide" element={<GuidePage />} />
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
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="mentions-legales" element={<MentionsLegalesPage />} />
          <Route path="cgv" element={<CGVPage />} />
          <Route path="confidentialite" element={<ConfidentialitePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </AppLayout>
  )
}

export default App
