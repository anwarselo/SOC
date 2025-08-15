'use client'

import { useState } from 'react'
import { StatusButtons } from './StatusButtons'
import { CommentsBox } from './CommentsBox'
import { ScriptPanel } from './ScriptPanel'
import { EmptyState } from './EmptyState'
import { ErrorReporter } from './ErrorReporter'
import { LanguageToggle } from './LanguageToggle'
import { ProductReminder } from './ProductReminder'
import { CallHistory } from './CallHistory'

interface Customer {
  id: string
  name: string
  phone?: string
  city?: string
  status: 'pending' | 'callback' | 'completed'
  result: string | null
  callbackDate: string | null
  comments: string
  // Additional fields
  netValue?: number | null
  currency?: string
  lastPurchaseDate?: string | null
  noOfPurchases?: number
  contactPerson?: string | null
  salesType?: string
  province?: string
  country?: string
}

interface StatusChangeData {
  status?: 'pending' | 'callback' | 'completed'
  result?: string | null
  callbackDate?: string | null
  comments?: string
}

interface CustomerCardCleanProps {
  customer: Customer | null
  view?: 'pending' | 'callbacks'
  onStatusChange: (data: StatusChangeData) => void
  onCommentsChange: (value: string) => void
  onCommentsSave?: () => void
}

export function CustomerCardClean({
  customer,
  view = 'pending',
  onStatusChange,
  onCommentsChange,
  onCommentsSave
}: CustomerCardCleanProps) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const [showHistory, setShowHistory] = useState(false)

  if (!customer) {
    return <EmptyState view={view} />
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en')
  }

  // Format phone number: +971 (0) 56 555 5555
  const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return '—'
    
    const cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.startsWith('971')) {
      const number = cleaned.substring(3)
      if (number.length >= 9) {
        return `+971 (0) ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
      }
    } else if (cleaned.startsWith('0')) {
      const number = cleaned.substring(1)
      if (number.length >= 8) {
        return `+971 (0) ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
      }
    }
    
    return phone
  }

  // Format currency value
  const formatCurrency = (value: number | null | undefined, currency: string | undefined) => {
    if (!value) return '—'
    const formatted = new Intl.NumberFormat('en-US').format(value)
    return `${formatted} ${currency || 'AED'}`
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.name}</h1>
            <div className="flex items-center gap-6 text-gray-600">
              <span>ID: {customer.id.slice(-8)}</span>
              <span>{formatPhoneNumber(customer.phone)}</span>
              <span>{customer.city}, {customer.province || 'Dubai'}</span>
              <span className="text-lg font-semibold text-[#886baa]">
                {formatCurrency(customer.netValue, customer.currency)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle language={language} onToggle={toggleLanguage} />
            <ErrorReporter />
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Script and Actions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Script Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <ScriptPanel 
              status={customer.status} 
              callbackDate={customer.callbackDate || undefined} 
              language={language} 
            />
          </div>

          {/* Product Reminder */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <ProductReminder language={language} />
          </div>

          {/* Comments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Notes</h3>
            <CommentsBox 
              value={customer.comments} 
              onChange={onCommentsChange}
              onSave={onCommentsSave}
              customerId={customer.id}
            />
            {customer.result === 'Interested' && !customer.comments && (
              <p className="text-sm text-orange-600 mt-3">⚠️ Please add notes for interested customers</p>
            )}
          </div>

        </div>

        {/* Right Column - Actions and Secondary Info */}
        <div className="space-y-8">
          
          {/* Quick Actions */}
          {customer.status !== 'completed' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <StatusButtons onAction={onStatusChange} />
            </div>
          )}

          {/* Customer Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  customer.status === 'completed' ? 'bg-green-500' :
                  customer.status === 'callback' ? 'bg-orange-500' :
                  'bg-gray-400'
                }`}></div>
                <span className="font-medium capitalize text-gray-900">{customer.status}</span>
              </div>
              {customer.result && (
                <div className="text-sm text-gray-600">
                  <strong>Result:</strong> {customer.result}
                </div>
              )}
              {customer.callbackDate && (
                <div className="text-sm text-gray-600">
                  <strong>Callback:</strong> {customer.callbackDate}
                </div>
              )}
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Contact Person:</span>
                <span className="ml-2 text-gray-900">{customer.contactPerson || customer.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Sales Type:</span>
                <span className="ml-2 text-gray-900">{customer.salesType || 'RETAIL'}</span>
              </div>
              <div>
                <span className="text-gray-500">Total Orders:</span>
                <span className="ml-2 text-gray-900">{customer.noOfPurchases || 0}</span>
              </div>
              {customer.lastPurchaseDate && (
                <div>
                  <span className="text-gray-500">Last Purchase:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(customer.lastPurchaseDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Call History Toggle */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">Call History</h3>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showHistory && (
              <div className="mt-4">
                <CallHistory customerId={customer.id} />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}