import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Stardew Tracker',
  description: 'Track your Stardew Valley progress — shipping, bundles, friendship, crops and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-w-0 p-4 lg:p-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}

