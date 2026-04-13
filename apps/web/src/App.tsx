import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { AppLayout } from './components/layout/AppLayout'
import { PageShell } from './components/layout/PageShell'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ChatBubble } from './components/ui/ChatBubble'
import { Toast } from './components/ui/Toast'
import BlogArticlePage from './pages/BlogArticlePage'
import BlogPage from './pages/BlogPage'
import CGVPage from './pages/CGVPage'
import ConfidentialitePage from './pages/ConfidentialitePage'
import DashboardPage from './pages/DashboardPage'
import FAQPage from './pages/FAQPage'
import GuidePage from './pages/GuidePage'
import HomePage from './pages/HomePage'
import HowItWorksPage from './pages/HowItWorksPage'
import LoginPage from './pages/LoginPage'
import MentionsLegalesPage from './pages/MentionsLegalesPage'
import ModpackDetailPage from './pages/ModpackDetailPage'
import ModpacksPage from './pages/ModpacksPage'
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
  const location = useLocation()

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7546/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'db5095' },
      body: JSON.stringify({
        sessionId: 'db5095',
        runId: 'initial',
        hypothesisId: 'H1',
        location: 'App.tsx:35',
        message: 'App mounted',
        data: { pathname: location.pathname },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
  }, [location.pathname])

  useEffect(() => {
    const onWindowError = (event: ErrorEvent) => {
      // #region agent log
      fetch('http://127.0.0.1:7546/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'db5095' },
        body: JSON.stringify({
          sessionId: 'db5095',
          runId: 'initial',
          hypothesisId: 'H4',
          location: 'App.tsx:53',
          message: 'window error captured',
          data: { message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      // #region agent log
      fetch('http://127.0.0.1:7546/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'db5095' },
        body: JSON.stringify({
          sessionId: 'db5095',
          runId: 'initial',
          hypothesisId: 'H5',
          location: 'App.tsx:71',
          message: 'unhandled rejection captured',
          data: { reason: String(event.reason) },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion
    }

    window.addEventListener('error', onWindowError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)
    return () => {
      window.removeEventListener('error', onWindowError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [])

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
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogArticlePage />} />
          <Route path="modpacks" element={<ModpacksPage />} />
          <Route path="modpacks/:slug" element={<ModpackDetailPage />} />
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
      <ChatBubble />
      <Analytics />
    </AppLayout>
  )
}

export default App
