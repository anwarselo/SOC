'use client'

import { useState } from 'react'
import { CustomerHeader } from './CustomerHeader'
import { ContactInfo } from './ContactInfo'
import { ActionPanel } from './ActionPanel'
import { CustomerTabs } from './CustomerTabs'
import { CommentsBox } from './CommentsBox'
import { ScriptPanel } from './ScriptPanel'
import { ProductReminder } from './ProductReminder'
import { EmptyState } from './EmptyState'

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

interface CustomerCardSimpleProps {
  customer: Customer | null
  view?: 'pending' | 'callbacks'
  onStatusChange: (data: StatusChangeData) => void
  onCommentsChange: (value: string) => void
  onCommentsSave?: () => void
}

export function CustomerCardSimple({
  customer,
  view = 'pending',
  onStatusChange,
  onCommentsChange,
  onCommentsSave
}: CustomerCardSimpleProps) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const [showDetails, setShowDetails] = useState(false)

  if (!customer) {
    return <EmptyState view={view} />
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Main Customer Header */}
      <CustomerHeader 
        customer={customer}
        language={language}
        onLanguageToggle={toggleLanguage}
      />

      {/* Current Script - Most Important */}
      <ScriptPanel 
        status={customer.status} 
        callbackDate={customer.callbackDate || undefined} 
        language={language} 
      />

      {/* Quick Contact & Actions Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ContactInfo customer={customer} />
        <ActionPanel 
          customerStatus={customer.status}
          onStatusChange={onStatusChange}
        />
      </div>

      {/* Product Reminder */}
      <ProductReminder language={language} />

      {/* Comments Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <CommentsBox 
          value={customer.comments} 
          onChange={onCommentsChange}
          onSave={onCommentsSave}
          customerId={customer.id}
        />
        {customer.result === 'Interested' && !customer.comments && (
          <p className="text-xs text-orange-600 mt-2">⚠️ Please add notes for interested customers</p>
        )}
      </div>

      {/* Expandable Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-4 py-3 text-left flex items-center justify-between font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Customer History & Details
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showDetails && (
          <div className="border-t border-gray-200">
            <CustomerTabs customer={customer} />
          </div>
        )}
      </div>
    </div>
  )
}