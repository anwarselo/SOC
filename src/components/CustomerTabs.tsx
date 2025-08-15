'use client'

import { useState } from 'react'
import { CallHistory } from './CallHistory'

interface Customer {
  id: string
  lastPurchaseDate?: string | null
  noOfPurchases?: number
}

interface CustomerTabsProps {
  customer: Customer
}

export function CustomerTabs({ customer }: CustomerTabsProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'purchase'>('history')

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-[#886baa] text-[#886baa]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Call History
          </button>
          <button
            onClick={() => setActiveTab('purchase')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'purchase'
                ? 'border-[#886baa] text-[#886baa]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Purchase History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'history' && (
          <CallHistory customerId={customer.id} />
        )}

        {activeTab === 'purchase' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{customer.noOfPurchases || 0}</div>
                <div className="text-sm text-gray-500">Total Orders</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900">{formatDate(customer.lastPurchaseDate)}</div>
                <div className="text-sm text-gray-500">Last Purchase</div>
              </div>
            </div>
            {(customer.noOfPurchases || 0) === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6a3 3 0 006 0v-6M5 13a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6z" />
                </svg>
                <p>No purchase history available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}