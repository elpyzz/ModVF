import type { PropsWithChildren } from 'react'
import { useState } from 'react'
import { Footer } from './Footer'
import { FreeModpackBanner } from './FreeModpackBanner'
import { Header } from './Header'

export function AppLayout({ children }: PropsWithChildren) {
  const [bannerVisible, setBannerVisible] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-dark text-text">
      <FreeModpackBanner onVisibilityChange={setBannerVisible} />
      <Header hasTopBanner={bannerVisible} />
      <main className={`mx-auto w-full max-w-6xl flex-1 px-4 pb-10 ${bannerVisible ? 'pt-[8.5rem]' : 'pt-24'} sm:px-6 lg:px-8`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
