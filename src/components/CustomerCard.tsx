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

interface CustomerCardProps {
  customer: Customer | null
  view?: 'pending' | 'callbacks'
  onStatusChange: (data: StatusChangeData) => void
  onCommentsChange: (value: string) => void
  onCommentsSave?: () => void
}

export function CustomerCard({
  customer,
  view = 'pending',
  onStatusChange,
  onCommentsChange,
  onCommentsSave
}: CustomerCardProps) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en')

  if (!customer) {
    return <EmptyState view={view} />
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en')
  }

  // Format phone number: +971 (0) 56 555 5555
  const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return '—'
    
    // Remove any non-numeric characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Handle different formats
    let formatted = phone
    if (cleaned.startsWith('971')) {
      const number = cleaned.substring(3)
      if (number.length >= 9) {
        formatted = `+971 (0) ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
      }
    } else if (cleaned.startsWith('0')) {
      const number = cleaned.substring(1)
      if (number.length >= 8) {
        formatted = `+971 (0) ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
      }
    } else if (phone.startsWith('+')) {
      // Already formatted, just clean it up
      const number = cleaned.substring(3)
      if (number.length >= 9) {
        formatted = `+971 (0) ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
      }
    }
    
    return formatted
  }

  // Format currency value
  const formatCurrency = (value: number | null | undefined, currency: string | undefined) => {
    if (!value) return '—'
    const formatted = new Intl.NumberFormat('en-US').format(value)
    return `${formatted} ${currency || 'AED'}`
  }

  // Format date
  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  return (
    <div className="customer-card relative bg-white/95 backdrop-blur-sm rounded-2xl border border-[#e3d8eb] shadow-xl shadow-[#886baa]/10 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#886baa]/20">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-[#e3d8eb]/30 to-[#c7b1d7]/20 rounded-full -translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-[#c7b1d7]/20 to-[#886baa]/10 rounded-full translate-x-16 translate-y-16"></div>
      
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#e3d8eb]/50 via-[#c7b1d7]/30 to-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 flex justify-between items-start border border-[#c7b1d7]/40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#886baa] to-[#543b73] rounded-xl opacity-20 blur-sm"></div>
            <div className="relative bg-white p-3 rounded-xl shadow-md border border-[#e3d8eb]">
              <svg className="w-8 h-8 text-[#886baa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#543b73] via-[#8a4a62] to-[#886baa] bg-clip-text text-transparent tracking-tight">
              {customer.name || '—'}
            </h2>
            <p className="text-sm text-[#a97e9d] font-medium">Customer ID: {customer.id.slice(-8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle language={language} onToggle={toggleLanguage} />
          <ErrorReporter />
        </div>
      </div>

      {/* Contact Info */}
      <div className="relative grid grid-cols-2 gap-6 mb-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#e3d8eb] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#886baa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm font-medium text-[#8a4a62]">Phone</span>
          </div>
          <p className="font-bold text-[#543b73] text-lg">{formatPhoneNumber(customer.phone)}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#886baa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium text-[#8a4a62]">Contact Person</span>
          </div>
          <p className="font-semibold text-[#543b73]">{customer.contactPerson || customer.name}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#886baa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-[#8a4a62]">Location</span>
          </div>
          <p className="font-semibold text-[#543b73]">{customer.city || '—'}, {customer.province || 'Dubai'}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#886baa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6a3 3 0 006 0v-6M5 13a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6z" />
            </svg>
            <span className="text-sm font-medium text-[#8a4a62]">Sales Type</span>
          </div>
          <p className="font-semibold text-[#543b73]">{customer.salesType || 'RETAIL'}</p>
        </div>
      </div>

      {/* Purchase History */}
      <div className="relative grid grid-cols-3 gap-6 mb-6 p-6 bg-gradient-to-r from-[#c7b1d7]/20 via-[#e3d8eb]/30 to-white/80 backdrop-blur-sm rounded-2xl border border-[#c7b1d7]/40 shadow-sm">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#886baa]/5 to-[#a97e9d]/5 rounded-2xl"></div>
        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#8a4a62]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="text-sm font-semibold text-[#543b73]">Total Value</span>
          </div>
          <p className="font-bold text-[#543b73] text-xl">{formatCurrency(customer.netValue, customer.currency)}</p>
        </div>
        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#8a4a62]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8V9a2 2 0 012-2h4a2 2 0 012 2v2M8 13v6a2 2 0 002 2h4a2 2 0 002-2v-6" />
            </svg>
            <span className="text-sm font-semibold text-[#543b73]">Last Purchase</span>
          </div>
          <p className="font-semibold text-[#543b73]">{formatDate(customer.lastPurchaseDate)}</p>
        </div>
        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#8a4a62]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="text-sm font-semibold text-[#543b73]">Total Orders</span>
          </div>
          <p className="font-semibold text-[#543b73] text-lg">{customer.noOfPurchases || 0} orders</p>
        </div>
      </div>

      {/* Status Info */}
      <div className="relative grid grid-cols-3 gap-6 mb-6 p-6 bg-gradient-to-r from-[#e3d8eb]/50 via-[#c7b1d7]/30 to-[#a97e9d]/20 backdrop-blur-sm rounded-2xl border border-[#c7b1d7]/40 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              customer.status === 'completed' ? 'bg-emerald-500 animate-pulse' :
              customer.status === 'callback' ? 'bg-[#e17553] animate-pulse' :
              'bg-[#a97e9d]'
            }`}></div>
            <span className="text-sm font-semibold text-[#543b73]">Status</span>
          </div>
          <p className="font-bold text-[#543b73] text-lg capitalize">{customer.status}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#8a4a62]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8V9a2 2 0 012-2h4a2 2 0 012 2v2M8 13v6a2 2 0 002 2h4a2 2 0 002-2v-6" />
            </svg>
            <span className="text-sm font-semibold text-[#543b73]">Callback Date</span>
          </div>
          <p className="font-semibold text-[#543b73]">{customer.callbackDate || '—'}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#8a4a62]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-[#543b73]">Last Result</span>
          </div>
          <p className="font-semibold text-[#543b73]">{customer.result || 'No calls made'}</p>
        </div>
      </div>

      {/* Call History */}
      <CallHistory customerId={customer.id} />

      {/* Product Reminder */}
      <ProductReminder language={language} />

      {/* Script Panel */}
      <div className="mb-6">
        <ScriptPanel status={customer.status} callbackDate={customer.callbackDate || undefined} language={language} />
      </div>

      {/* Status Buttons */}
      {customer.status !== 'completed' && (
        <div className="mb-6 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#e3d8eb]/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#886baa] to-[#543b73] rounded-lg opacity-20 blur-sm"></div>
              <div className="relative bg-white p-2 rounded-lg shadow-sm border border-white/50">
                <svg className="w-5 h-5 text-[#886baa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-[#543b73] to-[#886baa] bg-clip-text text-transparent">
                Quick Actions
              </h3>
              <p className="text-sm text-[#8a4a62]">Choose the call outcome</p>
            </div>
          </div>
          <StatusButtons onAction={onStatusChange} />
        </div>
      )}

      {/* Comments */}
      <div className="mb-6">
        <CommentsBox 
          value={customer.comments} 
          onChange={onCommentsChange}
          onSave={onCommentsSave}
          customerId={customer.id}
        />
        {customer.result === 'Interested' && !customer.comments && (
          <p className="text-xs text-orange-600 mt-1">⚠️ Please add notes for interested customers</p>
        )}
      </div>

    </div>
  )
}