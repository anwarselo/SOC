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
    console.log('Current language:', language)
    setLanguage(prev => {
      const newLang = prev === 'en' ? 'ar' : 'en'
      console.log('New language:', newLang)
      return newLang
    })
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
    <div className="max-w-7xl mx-auto">
      {/* Header with Customer Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.name}</h1>
            <div className="flex items-center gap-6 text-gray-600 mb-2">
              <span>ID: {customer.id.slice(-8)}</span>
              <span>{formatPhoneNumber(customer.phone)}</span>
              <span>{customer.city}, {customer.province || 'Dubai'}</span>
              <span className="text-lg font-semibold text-[#886baa]">
                {formatCurrency(customer.netValue, customer.currency)}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Contact: {customer.contactPerson || customer.name}</span>
              <span>{customer.salesType || 'RETAIL'}</span>
              <span>{customer.noOfPurchases || 0} orders</span>
              {customer.lastPurchaseDate && (
                <span>Last purchase: {new Date(customer.lastPurchaseDate).toLocaleDateString('en-GB')}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle language={language} onToggle={toggleLanguage} />
            <ErrorReporter />
          </div>
        </div>

        {/* Top Bar with Status and Call History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          
          {/* Customer Status */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Status</h4>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                customer.status === 'completed' ? 'bg-green-500' :
                customer.status === 'callback' ? 'bg-orange-500' :
                'bg-gray-400'
              }`}></div>
              <span className="font-medium capitalize text-gray-900">{customer.status}</span>
              {customer.result && (
                <span className="text-sm text-gray-500">- {customer.result}</span>
              )}
            </div>
            {customer.callbackDate && (
              <div className="text-sm text-gray-500 mt-1">
                Callback: {customer.callbackDate}
              </div>
            )}
          </div>

          {/* Call History Toggle */}
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#886baa] transition-colors"
            >
              <span>Call History</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showHistory && (
              <div className="mt-2 max-h-32 overflow-y-auto">
                <CallHistory customerId={customer.id} />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Script and Product Info */}
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

        </div>

        {/* Right Column - Actions and Notes */}
        <div className="space-y-8">
          
          {/* Quick Actions - Fixed Layout */}
          {customer.status !== 'completed' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              {/* Fixed Action Buttons Grid */}
              <div className="space-y-3">
                {/* Row 1: Primary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onStatusChange({ status: 'completed', result: 'Interested' })}
                    className="p-3 border-2 border-green-300 rounded-lg bg-green-50 hover:bg-green-100 text-center transition-colors"
                  >
                    <div className="text-sm font-medium">✅ Interested</div>
                    <div className="text-sm text-gray-600">مهتم</div>
                  </button>
                  <button
                    onClick={() => onStatusChange({ status: 'completed', result: 'Not Interested' })}
                    className="p-3 border-2 border-orange-300 rounded-lg bg-orange-50 hover:bg-orange-100 text-center transition-colors"
                  >
                    <div className="text-sm font-medium">❌ Not Interested</div>
                    <div className="text-sm text-gray-600">غير مهتم</div>
                  </button>
                </div>

                {/* Row 2: Callback Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      onStatusChange({ 
                        status: 'callback', 
                        result: 'No Answer / Busy',
                        callbackDate: tomorrow.toISOString().split('T')[0]
                      })
                    }}
                    className="p-3 border-2 border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-center transition-colors"
                  >
                    <div className="text-sm font-medium">📞 No Answer</div>
                    <div className="text-sm text-gray-600">لا يجيب</div>
                  </button>
                  <button
                    onClick={() => {/* Schedule callback logic */}}
                    className="p-3 border-2 border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 text-center transition-colors"
                  >
                    <div className="text-sm font-medium">📅 Schedule</div>
                    <div className="text-sm text-gray-600">جدولة</div>
                  </button>
                </div>

                {/* Row 3: Wrong Number */}
                <button
                  onClick={() => onStatusChange({ status: 'completed', result: 'Wrong Number / Do Not Call' })}
                  className="w-full p-3 border-2 border-red-300 rounded-lg bg-red-50 hover:bg-red-100 text-center transition-colors"
                >
                  <div className="text-sm font-medium">🚫 Wrong Number</div>
                  <div className="text-sm text-gray-600">رقم خاطئ</div>
                </button>
              </div>
            </div>
          )}

          {/* Call Notes and Recording */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Notes & Recording</h3>
            <CommentsBox 
              value={customer.comments} 
              onChange={onCommentsChange}
              onSave={onCommentsSave}
              customerId={customer.id}
            />
            <div className="mt-2 text-xs text-gray-500">
              Current language: {language}
            </div>
            {customer.result === 'Interested' && !customer.comments && (
              <p className="text-sm text-orange-600 mt-3">⚠️ Please add notes for interested customers</p>
            )}
            
            {/* Voice Recording Placeholder */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#886baa] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Add Voice Memo
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}