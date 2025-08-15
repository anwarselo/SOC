'use client'

import { useState, useEffect, useCallback } from 'react'
import html2canvas from 'html2canvas'

interface ErrorReportData {
  errorType: 'manual_report' | 'nextjs_error' | 'javascript_error' | 'api_error'
  page: string
  message: string
  errorStack?: string
  errorComponent?: string
  pngBase64?: string
  browserInfo?: Record<string, unknown>
  pageState?: Record<string, unknown>
  formData?: Record<string, unknown>
}

export function ErrorReporter() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get user ID from localStorage
    setUserId(localStorage.getItem('userId'))
  }, [])

  const collectBrowserInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      url: window.location.href,
      timestamp: new Date().toISOString()
    }
  }

  const collectPageState = () => {
    const forms = Array.from(document.forms).map(form => {
      const formData = new FormData(form)
      const data: Record<string, FormDataEntryValue> = {}
      for (const [key, value] of formData.entries()) {
        // Don't capture sensitive data
        if (!key.toLowerCase().includes('password') && 
            !key.toLowerCase().includes('secret') &&
            !key.toLowerCase().includes('token')) {
          data[key] = value
        }
      }
      return { id: form.id, className: form.className, data }
    })

    return {
      title: document.title,
      forms,
      localStorage: Object.keys(localStorage).reduce((acc, key) => {
        // Only capture non-sensitive localStorage items
        if (!key.toLowerCase().includes('password') && 
            !key.toLowerCase().includes('secret') &&
            !key.toLowerCase().includes('token')) {
          acc[key] = localStorage.getItem(key)
        }
        return acc
      }, {} as Record<string, string | null>),
      errors: (window as unknown as Record<string, unknown>).__nextErrorsCache || []
    }
  }

  const reportError = useCallback(async (errorData: Partial<ErrorReportData>) => {
    setIsCapturing(true)
    setResult(null)

    try {
      let screenshot = ''
      
      // Capture screenshot if not provided
      if (!errorData.pngBase64) {
        try {
          const canvas = await html2canvas(document.body, {
            scale: 0.5,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          })
          screenshot = canvas.toDataURL('image/png')
        } catch (screenshotError) {
          console.warn('Failed to capture screenshot:', screenshotError)
          screenshot = ''
        }
      } else {
        screenshot = errorData.pngBase64
      }

      const reportData: ErrorReportData = {
        errorType: errorData.errorType || 'manual_report',
        page: errorData.page || window.location.pathname,
        message: errorData.message || 'User reported an issue',
        errorStack: errorData.errorStack,
        errorComponent: errorData.errorComponent,
        pngBase64: screenshot,
        browserInfo: errorData.browserInfo || collectBrowserInfo(),
        pageState: errorData.pageState || collectPageState(),
        formData: errorData.formData
      }

      // Send to API with user ID in header
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (userId) {
        headers['x-user-id'] = userId
      }

      const response = await fetch('/api/support/report', {
        method: 'POST',
        headers,
        body: JSON.stringify(reportData)
      })

      if (response.ok) {
        const data = await response.json()
        setResult({
          type: 'success',
          message: `Issue reported successfully. Log ID: ${data.logId}`
        })
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setResult(null), 5000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'API error')
      }
    } catch (error) {
      console.error('Error reporting failed:', error)
      setResult({
        type: 'error',
        message: 'Failed to report issue. Please try again.'
      })
      
      // Auto-hide error message after 8 seconds
      setTimeout(() => setResult(null), 8000)
    } finally {
      setIsCapturing(false)
    }
  }, [userId])

  const handleManualReport = () => {
    reportError({
      errorType: 'manual_report',
      message: 'User manually reported an issue'
    })
  }

  // Expose the reportError function globally for automatic error reporting
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__reportError = reportError
    
    // Capture unhandled JavaScript errors
    const handleError = (event: ErrorEvent) => {
      reportError({
        errorType: 'javascript_error',
        message: event.message,
        errorStack: event.error?.stack,
        errorComponent: event.filename
      })
    }

    // Capture unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError({
        errorType: 'javascript_error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        errorStack: event.reason?.stack
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      delete (window as unknown as Record<string, unknown>).__reportError
    }
  }, [userId, reportError])

  return (
    <>
      <button
        onClick={handleManualReport}
        disabled={isCapturing}
        className="px-3 py-1.5 text-sm border border-[#c7b1d7] rounded-lg bg-white/80 hover:bg-[#e3d8eb]/50 text-[#543b73] disabled:opacity-50 shadow-sm hover:shadow-md active:shadow-inner transition-all duration-200 font-medium"
      >
        {isCapturing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Capturing...
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Report Issue
          </span>
        )}
      </button>
      
      {result && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl border shadow-lg z-50 min-w-80 ${
          result.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start gap-3">
            {result.type === 'success' ? (
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <div>
              <p className="text-sm font-medium">{result.message}</p>
              <button 
                onClick={() => setResult(null)}
                className="text-xs underline mt-1 opacity-70 hover:opacity-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}