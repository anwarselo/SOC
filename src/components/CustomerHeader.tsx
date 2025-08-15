'use client'

import { LanguageToggle } from './LanguageToggle'
import { ErrorReporter } from './ErrorReporter'

interface Customer {
  id: string
  name: string
  netValue?: number | null
  currency?: string
}

interface CustomerHeaderProps {
  customer: Customer
  language: 'en' | 'ar'
  onLanguageToggle: () => void
}

export function CustomerHeader({ customer, language, onLanguageToggle }: CustomerHeaderProps) {
  const formatCurrency = (value: number | null | undefined, currency: string | undefined) => {
    if (!value) return '—'
    const formatted = new Intl.NumberFormat('en-US').format(value)
    return `${formatted} ${currency || 'AED'}`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="bg-[#886baa] p-3 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-gray-500">ID: {customer.id.slice(-8)}</p>
              <div className="text-lg font-semibold text-[#886baa]">
                {formatCurrency(customer.netValue, customer.currency)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle language={language} onToggle={onLanguageToggle} />
          <ErrorReporter />
        </div>
      </div>
    </div>
  )
}