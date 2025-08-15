'use client'

import { StatusButtons } from './StatusButtons'

interface StatusChangeData {
  status?: 'pending' | 'callback' | 'completed'
  result?: string | null
  callbackDate?: string | null
  comments?: string
}

interface ActionPanelProps {
  customerStatus: 'pending' | 'callback' | 'completed'
  onStatusChange: (data: StatusChangeData) => void
}

export function ActionPanel({ customerStatus, onStatusChange }: ActionPanelProps) {
  if (customerStatus === 'completed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 text-green-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">Call Completed</span>
        </div>
        <p className="text-sm text-green-700 mt-1">Customer contacted successfully.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-[#886baa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Actions
      </h3>
      <StatusButtons onAction={onStatusChange} />
    </div>
  )
}