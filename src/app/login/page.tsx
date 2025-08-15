'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { signIn } from '@/lib/auth-client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError('Invalid email or password')
        return
      }

      // Successful login - BetterAuth handles session management
      // The user data is available in result.data.user
      const user = result.data?.user
      
      if (user) {
        // Store additional info in localStorage for compatibility
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userRole', (user as any).role || 'agent')
        localStorage.setItem('userId', user.id)
        localStorage.setItem('userName', (user as any).fullName || user.name || '')
        localStorage.setItem('sedarNumber', (user as any).sedarNumber || '')
        localStorage.setItem('assignedCodes', (user as any).assignedCodes || '[]')

        // Redirect based on role
        const userRole = (user as any).role || 'agent'
        if (userRole === 'admin' || userRole === 'supervisor') {
          router.push('/app/admin')
        } else {
          router.push('/app/calls')
        }
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
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  Email Address
                  <span className="text-slate-500 font-normal">/ البريد الإلكتروني</span>
                </span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-slate-800 placeholder-slate-400 transition-all duration-200 hover:bg-white/90"
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
              disabled={loading || !email.trim() || !password.trim()}
              className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform relative overflow-hidden ${
                loading || !email.trim() || !password.trim()
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

          {/* Create Account Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="font-semibold text-[#8a4a62] hover:text-[#543b73] transition-colors duration-200"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}