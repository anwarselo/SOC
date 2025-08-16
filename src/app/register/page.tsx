'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth-client'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    phoneNumber: '+971',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'phoneNumber') {
      // Ensure phone number always starts with +971
      const cleanedValue = value.replace(/\D/g, '') // Remove non-digits
      const formattedValue = cleanedValue.startsWith('971') 
        ? '+' + cleanedValue 
        : '+971' + cleanedValue.substring(cleanedValue.length > 3 ? 3 : 0)
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'employeeId' ? value.toUpperCase() : value
      }))
    }
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

    if (!formData.employeeId.trim()) {
      setError('Employee ID is required')
      setLoading(false)
      return
    }

    if (!formData.phoneNumber || formData.phoneNumber.length < 13) {
      setError('Please enter a valid UAE phone number')
      setLoading(false)
      return
    }

    try {
      // Create email from employee ID for Supabase compatibility
      const email = `${formData.employeeId.toLowerCase()}test@gmail.com`
      
      const result = await signUp.email({
        email: email,
        password: formData.password,
        fullName: formData.fullName,
        sedarNumber: formData.employeeId.toUpperCase(),
        phoneNumber: formData.phoneNumber
      })

      if (result.error) {
        setError(result.error || 'Registration failed')
        return
      }

      // Registration successful - user created with pending status
      if (result.data) {
        console.log('Registration successful:', result.data)
        
        // No need to sign out as user is created with pending status
        // and won't be able to login until approved
      }
      
      // Success - redirect to login with success message
      router.push('/login?message=Account created successfully! Please wait for admin approval before logging in.')

    } catch (err) {
      console.error('Registration error:', err)
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#e3d8eb] to-[#c7b1d7] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-xl  border border-[#e3d8eb]/50 shadow-2xl shadow-[#886baa]/10 p-8">
          
          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#543b73] via-[#8a4a62] to-[#886baa] bg-clip-text text-transparent tracking-tight">
              Create Account
            </h1>
            <p className="text-[#a97e9d] font-medium text-sm tracking-wide mt-1">
              Join Sedar Outreach CRM
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 ">
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
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-slate-800 placeholder-slate-400 transition-all duration-200 hover:bg-white/90"
                required
                disabled={loading}
              />
            </div>

            {/* Employee ID */}
            <div className="space-y-2">
              <label htmlFor="employeeId" className="block text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0H9" />
                  </svg>
                  Employee ID
                  <span className="text-slate-500 font-normal">/ رقم الموظف</span>
                </span>
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                value={formData.employeeId}
                onChange={handleInputChange}
                placeholder="e.g., SE001, AD005"
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-slate-800 placeholder-slate-400 font-mono transition-all duration-200 hover:bg-white/90"
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-500">This will be your login identifier</p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Phone Number
                  <span className="text-slate-500 font-normal">/ رقم الهاتف</span>
                </span>
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+971 50 123 4567"
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-slate-800 placeholder-slate-400 font-mono transition-all duration-200 hover:bg-white/90"
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-500">UAE phone number required</p>
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
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-slate-800 placeholder-slate-400 transition-all duration-200 hover:bg-white/90"
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
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200/50  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-slate-800 placeholder-slate-400 transition-all duration-200 hover:bg-white/90"
                required
                disabled={loading}
              />
            </div>
            
            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4  font-semibold text-white shadow-lg transition-all duration-300 transform relative overflow-hidden ${
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