'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { signUp } from '@/lib/auth-client'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    sedarNumber: '',
    password: '',
    confirmPassword: '',
    role: 'agent'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const result = await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
      })

      if (result.error) {
        setError(result.error.message || 'Registration failed')
        return
      }

      // TODO: After successful registration, update the user with additional fields
      // This would require a backend API endpoint to update the auth_user table
      // For now, we'll just redirect to login
      
      // Success - redirect to login with success message
      router.push('/login?message=Account created successfully. Please log in.')

    } catch (err) {
      console.error('Registration error:', err)
      setError('Registration failed. Please try again.')
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
          <div className="text-center mb-6 relative">
            <div className="relative inline-block">
              <div className="absolute -inset-3 bg-gradient-to-r from-[#886baa] via-[#8a4a62] to-[#543b73] rounded-2xl opacity-20 blur-lg animate-pulse"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-lg border border-[#e3d8eb]">
                <Image src="/sedar-big.jpg" alt="Sedar Global" width={64} height={64} className="h-16 mx-auto filter brightness-110 contrast-110" />
              </div>
            </div>
            <div className="mt-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#543b73] via-[#8a4a62] to-[#886baa] bg-clip-text text-transparent tracking-tight">
                Create Account
              </h1>
              <p className="text-[#a97e9d] font-medium text-sm tracking-wide mt-1">
                Join SedarOutreach CRM
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-slate-800 placeholder-slate-400 transition-all duration-200 hover:bg-white/90"
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-slate-800 placeholder-slate-400 transition-all duration-200 hover:bg-white/90"
                required
                disabled={loading}
              />
            </div>

            {/* Sedar Number */}
            <div className="space-y-2">
              <label htmlFor="sedarNumber" className="block text-sm font-semibold text-slate-700">
                Sedar Number (Optional)
              </label>
              <input
                id="sedarNumber"
                name="sedarNumber"
                type="text"
                value={formData.sedarNumber}
                onChange={(e) => setFormData(prev => ({...prev, sedarNumber: e.target.value.toUpperCase()}))}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 font-mono text-slate-800 placeholder-slate-400 transition-all duration-200 hover:bg-white/90"
                placeholder="e.g., SE001"
                disabled={loading}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-semibold text-slate-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-slate-800 transition-all duration-200 hover:bg-white/90"
                disabled={loading}
              >
                <option value="agent">Sales Agent</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-slate-800 placeholder-slate-400 transition-all duration-200 hover:bg-white/90"
                required
                disabled={loading}
                minLength={8}
              />
              <p className="text-xs text-slate-500">Minimum 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-slate-800 placeholder-slate-400 transition-all duration-200 hover:bg-white/90"
                required
                disabled={loading}
              />
            </div>
            
            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform relative overflow-hidden ${
                loading
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create Account
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-semibold text-[#8a4a62] hover:text-[#543b73] transition-colors duration-200"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}