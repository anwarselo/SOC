'use client'

import { AppTopbar } from '@/components/system-foundation/AppTopbar'
import { CopyBlocker } from '@/components/system-foundation/CopyBlocker'
import { FontSelector } from '@/components/user-experience/FontSelector'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CopyBlocker />
      <div className="min-h-screen bg-gradient-to-br from-white via-[#e3d8eb]/20 to-[#c7b1d7]/10">
        <AppTopbar />
        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
      </div>
      <FontSelector />
    </>
  )
}