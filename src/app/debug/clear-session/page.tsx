'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ClearSessionPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const clearSession = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // Call the clear session API
      const response = await fetch('/api/debug/clear-session', {
        method: 'POST'
      })
      
      if (response.ok) {
        // Clear localStorage
        localStorage.clear()
        
        // Clear cookies client-side as well
        document.cookie = 'better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'better-auth.csrf_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        
        setMessage('Session cleared successfully! Redirecting to login...')
        
        // Force redirect with page reload
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      } else {
        setMessage('Failed to clear session')
      }
    } catch (error) {
      console.error('Error clearing session:', error)
      setMessage('Error clearing session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#e3d8eb] to-[#c7b1d7] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl  border border-[#e3d8eb]/50 shadow-2xl shadow-[#886baa]/10 p-8">
        <h1 className="text-2xl font-bold text-center text-[#543b73] mb-6">
          Debug: Clear Session
        </h1>
        
        <p className="text-sm text-gray-600 mb-6 text-center">
          Use this page to force-clear all authentication cookies and localStorage data.
        </p>
        
        {message && (
          <div className={`mb-4 p-3  text-sm ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={clearSession}
            disabled={loading}
            className={`w-full py-3  font-semibold transition-colors ${
              loading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {loading ? 'Clearing...' : 'Clear All Sessions & Cookies'}
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3  font-semibold bg-[#886baa] hover:bg-[#8a4a62] text-white transition-colors"
          >
            Go to Login Page
          </button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500 text-center">
          Current cookies and localStorage will be displayed in browser dev tools
        </div>
      </div>
    </div>
  )
}