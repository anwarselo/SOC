'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ProfessionalHeaderProps {
  title: string
  subtitle?: string
  onLogout?: () => void
}

export function ProfessionalHeader({ title, subtitle, onLogout }: ProfessionalHeaderProps) {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [sedarNumber, setSedarNumber] = useState('')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    setUserName(localStorage.getItem('userName') || '')
    setSedarNumber(localStorage.getItem('sedarNumber') || '')
  }, [])
  
  const handleLogout = async () => {
    try {
      // Use BetterAuth signOut function
      const { signOut } = await import('@/lib/auth-client')
      await signOut()
      
      // Clear localStorage
      localStorage.clear()
      
      if (onLogout) {
        onLogout()
      } else {
        // Redirect to login page
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if logout fails
      localStorage.clear()
      window.location.href = '/login'
    }
  }

  return (
    <div className="relative bg-white border-b border-gray-200 shadow-sm">
      
      <div className="relative px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo and Title Section */}
          <div className="flex items-center gap-6">
            {/* Enhanced Logo Container */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#886baa] via-[#543b73] to-[#8a4a62]  opacity-20 blur-sm group-hover:opacity-30 transition-all duration-300"></div>
              <div className="relative bg-white p-3  shadow-lg border border-[#e3d8eb] group-hover:shadow-xl transition-all duration-300">
                <Image 
                  src="/sedar-big.jpg" 
                  alt="Sedar Global" 
                  width={48}
                  height={48}
                  className="h-12 w-auto filter brightness-110 contrast-110" 
                />
              </div>
            </div>
            
            {/* Title Section with Corporate Styling */}
            <div className="border-l-2 border-[#c7b1d7] pl-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#543b73] via-[#8a4a62] to-[#886baa] bg-clip-text text-transparent tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-[#a97e9d] font-medium mt-1 tracking-wide">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* User Actions Section */}
          <div className="flex items-center gap-4">
            {/* User Status Badge */}
            <div className="hidden sm:flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2.5  border border-[#e3d8eb] shadow-sm">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-[#e17553]  animate-pulse"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-[#e17553]  animate-ping opacity-20"></div>
                </div>
                <span className="text-sm text-[#543b73] font-semibold">Online</span>
              </div>
              <div className="w-px h-4 bg-[#c7b1d7]"></div>
              <div className="text-right">
                <div className="text-xs text-[#a97e9d] uppercase tracking-wide">Welcome</div>
                <div className="text-sm font-bold text-[#543b73]">{mounted ? userName : ''}</div>
              </div>
            </div>
            
            {/* Sedar Number Badge */}
            {mounted && sedarNumber && (
              <div className="bg-gradient-to-r from-[#e3d8eb] to-[#c7b1d7] px-3 py-2  border border-[#c7b1d7]">
                <div className="text-xs text-[#a97e9d] uppercase tracking-wider">ID</div>
                <div className="text-sm font-mono font-bold text-[#543b73]">{sedarNumber}</div>
              </div>
            )}
            
            {/* Professional Logout Button */}
            <button
              onClick={handleLogout}
              className="group relative px-5 py-2.5 bg-gradient-to-r from-[#e17553] to-[#8a4a62] text-white  font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#8a4a62] hover:to-[#543b73] transform hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </span>
              <div className="absolute inset-0 bg-white/20  opacity-0 group-hover:opacity-100 transition-all duration-300 group-active:bg-white/30"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}