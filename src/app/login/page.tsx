'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [sedarNumber, setSedarNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check user in sco_users table
      const { data: userData, error: userError } = await supabase
        .from('sco_users')
        .select('*')
        .eq('sedar_number', sedarNumber.toUpperCase())
        .eq('password_hash', password) // In production, use proper password hashing
        .single()

      if (userError || !userData) {
        setError('Invalid Sedar Number or Password')
        setLoading(false)
        return
      }

      // Store user info in localStorage
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userRole', userData.role)
      localStorage.setItem('userId', userData.id)
      localStorage.setItem('userName', userData.full_name)
      localStorage.setItem('sedarNumber', userData.sedar_number)
      localStorage.setItem('assignedCodes', JSON.stringify(userData.assigned_codes || []))

      // Set session cookie
      document.cookie = 'demo-session=true; path=/; max-age=3600'

      // Redirect based on role
      if (userData.role === 'admin' || userData.role === 'supervisor') {
        router.push('/app/admin')
      } else {
        router.push('/app/calls')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#e3d8eb] to-[#c7b1d7] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23e2e8f0\" fill-opacity=\"0.3\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      }}></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-[#e3d8eb]/50 shadow-2xl shadow-[#886baa]/10 p-8 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#c7b1d7]/20 to-[#886baa]/10 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-[#a97e9d]/15 to-[#8a4a62]/10 rounded-full translate-x-12 translate-y-12"></div>
          
          {/* Logo Section */}
          <div className="text-center mb-8 relative">
            <div className="relative inline-block">
              <div className="absolute -inset-3 bg-gradient-to-r from-[#886baa] via-[#8a4a62] to-[#543b73] rounded-2xl opacity-20 blur-lg animate-pulse"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-lg border border-[#e3d8eb]">
                <Image src="/sedar-big.jpg" alt="Sedar Global" width={64} height={64} className="h-16 mx-auto filter brightness-110 contrast-110" />
              </div>
            </div>
            <div className="mt-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#543b73] via-[#8a4a62] to-[#886baa] bg-clip-text text-transparent tracking-tight">
                SedarOutreach
              </h1>
              <p className="text-[#a97e9d] font-medium text-sm tracking-wide mt-1">
                Customer Relationship Management
              </p>
            </div>
          </div>
          
          {/* Test Accounts Info */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/30 rounded-xl">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-blue-700">Demo Accounts:</span>
              <br/>
              <span className="font-mono bg-white/60 px-2 py-1 rounded text-xs mt-1 inline-block">Admin: ADMIN001 / admin123</span>
              <br/>
              <span className="font-mono bg-white/60 px-2 py-1 rounded text-xs mt-1 inline-block">Sales: SE001 / pass123</span>
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sedar Number Input */}
            <div className="space-y-2">
              <label htmlFor="sedarNumber" className="block text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 118 0v2m-4 0a2 2 0 104 0m-4 0v2m0 0h4v2m-4-2v6m4-6v6" />
                  </svg>
                  Sedar Number
                  <span className="text-slate-500 font-normal">/ رقم سيدار</span>
                </span>
              </label>
              <div className="relative">
                <input
                  id="sedarNumber"
                  type="text"
                  value={sedarNumber}
                  onChange={(e) => setSedarNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., SE001 or ADMIN001"
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 font-mono text-slate-800 placeholder-slate-400 transition-all duration-200 hover:bg-white/90"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Password
                  <span className="text-slate-500 font-normal">/ كلمة المرور</span>
                </span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-slate-800 placeholder-slate-400 transition-all duration-200 hover:bg-white/90"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || !sedarNumber.trim() || !password.trim()}
              className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform relative overflow-hidden ${
                loading || !sedarNumber.trim() || !password.trim()
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#886baa] via-[#8a4a62] to-[#543b73] hover:from-[#8a4a62] hover:via-[#543b73] hover:to-[#543b73] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign In / تسجيل الدخول
                  </>
                )}
              </div>
              {!loading && (
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}