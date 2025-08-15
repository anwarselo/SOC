'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Report the error automatically
    this.reportError(error, errorInfo)
  }

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Use the global error reporting function if available
      const reportError = (window as unknown as Record<string, unknown>).__reportError as (errorData: Partial<{
        errorType: string;
        message: string;
        errorStack?: string;
        errorComponent?: string;
        browserInfo?: Record<string, unknown>;
        pageState?: Record<string, unknown>;
      }>) => Promise<void>
      
      if (reportError) {
        await reportError({
          errorType: 'nextjs_error',
          message: error.message,
          errorStack: error.stack,
          errorComponent: errorInfo.componentStack || undefined,
          browserInfo: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
          },
          pageState: {
            errorBoundary: true,
            componentStack: errorInfo.componentStack,
            errorDigest: (errorInfo as ErrorInfo & { errorDigest?: string }).errorDigest
          }
        })
      } else {
        // Fallback: direct API call
        const userId = localStorage.getItem('userId')
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        }
        
        if (userId) {
          headers['x-user-id'] = userId
        }

        await fetch('/api/support/report', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            errorType: 'nextjs_error',
            page: window.location.pathname,
            message: error.message,
            errorStack: error.stack,
            errorComponent: errorInfo.componentStack || undefined,
            browserInfo: {
              userAgent: navigator.userAgent,
              url: window.location.href,
              timestamp: new Date().toISOString()
            },
            pageState: {
              errorBoundary: true,
              componentStack: errorInfo.componentStack
            }
          })
        })
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#e3d8eb] via-white to-[#c7b1d7] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-[#e3d8eb] shadow-xl p-8 max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#543b73]">Something went wrong</h1>
                <p className="text-[#a97e9d]">An unexpected error occurred. The issue has been automatically reported.</p>
              </div>
            </div>

            <div className="bg-[#e3d8eb]/30 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-[#543b73] mb-2">Error Details:</h3>
              <p className="text-sm text-[#8a4a62] font-mono">{this.state.error?.message}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-[#886baa] to-[#543b73] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#8a4a62] hover:to-[#543b73] transform hover:-translate-y-0.5"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-white border-2 border-[#e3d8eb] text-[#543b73] rounded-xl font-semibold hover:bg-[#e3d8eb]/50 transition-all duration-300"
              >
                Go Back
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-[#8a4a62] hover:text-[#543b73]">
                  View Technical Details (Development Mode)
                </summary>
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Component Stack:</h4>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                  {this.state.error?.stack && (
                    <>
                      <h4 className="font-medium text-gray-700 mb-2 mt-4">Error Stack:</h4>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default GlobalErrorBoundary