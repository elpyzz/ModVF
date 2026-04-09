import type { PropsWithChildren } from 'react'
import { Footer } from './Footer'
import { Header } from './Header'

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-dark text-text">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 pt-24 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  )
}
