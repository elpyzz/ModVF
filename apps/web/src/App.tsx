import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { AppLayout } from './components/layout/AppLayout'
import { PageShell } from './components/layout/PageShell'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ChatBubble } from './components/ui/ChatBubble'
import { CookieBanner } from './components/ui/CookieBanner'
import { Toast } from './components/ui/Toast'
import BlogArticlePage from './pages/BlogArticlePage'
import BlogPage from './pages/BlogPage'
import CGVPage from './pages/CGVPage'
import ConfidentialitePage from './pages/ConfidentialitePage'
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

function DashboardMaintenance() {
  return (
    <section className="flex min-h-[70vh] w-full items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-500/10 p-8 text-center">
        <h1 className="text-3xl font-bold text-amber-100">Dashboard en maintenance</h1>
        <p className="mt-4 text-base text-amber-50/90">Le dashboard est temporairement indisponible pendant une intervention technique.</p>
        <p className="mt-2 text-sm text-amber-100/80">Merci de revenir dans quelques instants.</p>
      </div>
    </section>
  )
}

function App() {
  useTokenRefresh()
  const initialize = useAuthStore((state) => state.initialize)
  const location = useLocation()

  useEffect(() => {
  }, [location.pathname])

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
                <DashboardMaintenance />
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
      <CookieBanner />
      <Analytics />
    </AppLayout>
  )
}

export default App
