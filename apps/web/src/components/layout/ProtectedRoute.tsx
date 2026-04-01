import { LoaderCircle } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isLoading, isAuthenticated } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
