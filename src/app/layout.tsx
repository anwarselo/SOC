import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import GlobalErrorBoundary from '@/components/system-foundation/GlobalErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SedarOutreach',
  description: 'Professional customer relationship management system by Sedar Global',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-neutral-50 text-neutral-900`}>
        <GlobalErrorBoundary>
          {children}
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
