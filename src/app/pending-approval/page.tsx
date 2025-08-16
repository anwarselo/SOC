'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'
import { useState } from 'react'

export default function PendingApprovalPage() {
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#e3d8eb] to-[#c7b1d7] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-xl  border border-[#e3d8eb]/50 shadow-2xl shadow-[#886baa]/10 p-8">
          
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500  flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#543b73] via-[#8a4a62] to-[#886baa] bg-clip-text text-transparent tracking-tight">
              Account Pending Approval
            </h1>
            <p className="text-[#a97e9d] font-medium text-sm tracking-wide mt-1">
              Sedar Outreach CRM
            </p>
          </div>
          
          {/* Message */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50  p-6">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-yellow-400  flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Registration Successful!</h3>
                  <p className="text-yellow-700 text-sm leading-relaxed">
                    Your account has been created successfully. An administrator needs to approve your registration before you can access the system.
                  </p>
                  <p className="text-yellow-700 text-sm leading-relaxed mt-2">
                    Please contact your administrator or wait for approval notification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">What happens next?</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-2 h-2 bg-blue-400 "></div>
                <span>Admin reviews your registration</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-2 h-2 bg-blue-400 "></div>
                <span>You'll be notified when approved</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-2 h-2 bg-blue-400 "></div>
                <span>Then you can access the CRM system</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full py-3 bg-gradient-to-r from-[#886baa] via-[#8a4a62] to-[#543b73] text-white  font-semibold hover:from-[#8a4a62] hover:via-[#543b73] hover:to-[#543b73] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signingOut ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing Out...
                </div>
              ) : (
                'Sign Out'
              )}
            </button>
            
            <Link 
              href="/login"
              className="block w-full py-3 bg-white border-2 border-slate-200 text-slate-700  font-semibold text-center hover:bg-slate-50 transition-all duration-200"
            >
              Back to Login
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-500">
              Need help? Contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}