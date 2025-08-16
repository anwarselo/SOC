'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface CallHistoryItem {
  date: string
  status: string
  notes?: string
  outcome?: string
}

interface CallHistoryProps {
  customerId: string
}

export function CallHistory({ customerId }: CallHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [history, setHistory] = useState<CallHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  
  const fetchCallHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sco_call_outcomes')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      const formattedHistory: CallHistoryItem[] = (data || []).map(call => ({
        date: new Date(String(call.created_at || '')).toLocaleDateString('en-GB'),
        status: String(call.call_status || '').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        outcome: String(call.outcome || ''),
        notes: String(call.comments || '')
      }))

      setHistory(formattedHistory)
    } catch (error) {
      console.error('Error fetching call history:', error)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    fetchCallHistory()
  }, [fetchCallHistory])

  if (history.length === 0) {
    return null
  }

  return (
    <div className="mb-4 bg-[#F5F5F0]  border border-[#EDEDEA] p-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm font-medium text-[#2D3436] hover:text-[#5F9EA0] transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>📞 Call History</span>
          <span className="text-xs text-[#636E72]">/ سجل المكالمات</span>
          <span className="text-xs text-[#95A5A6]">({history.length} attempts)</span>
        </span>
        <span className="text-lg">{isExpanded ? '−' : '+'}</span>
      </button>
      
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {loading ? (
            <div className="text-xs text-[#95A5A6] text-center py-2">Loading history...</div>
          ) : history.map((item, index) => (
            <div key={index} className="text-xs border-l-2 border-[#B8D4D5] pl-3">
              <div className="flex items-center gap-2 font-medium text-[#2D3436]">
                <span>{item.date}</span>
                <span className="text-[#636E72]">•</span>
                <span className={
                  item.status.includes('Busy') || item.status.includes('No Answer') ? 'text-gray-600' :
                  item.status.includes('Callback') ? 'text-blue-600' :
                  item.status.includes('Completed') ? 'text-green-600' :
                  item.status.includes('Not Interested') ? 'text-orange-600' :
                  item.status.includes('Wrong') ? 'text-red-600' :
                  'text-[#636E72]'
                }>
                  {item.outcome || item.status}
                </span>
              </div>
              {item.notes && (
                <div className="text-[#95A5A6] mt-1">{item.notes}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}