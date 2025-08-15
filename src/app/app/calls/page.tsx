'use client'

import { useState, useEffect, useMemo } from 'react'
import { CustomerCard } from '@/components/CustomerCard'
import { supabase } from '@/lib/supabase'

interface Customer {
  id: string
  name: string
  phone: string
  city: string
  status: 'pending' | 'callback' | 'completed'
  result: string | null
  callbackDate: string | null
  comments: string
}

export default function CallsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'pending' | 'callbacks'>('pending')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    try {
      setLoading(true)
      
      // Get user's assigned codes from localStorage
      const assignedCodesStr = localStorage.getItem('assignedCodes')
      const userRole = localStorage.getItem('userRole')
      const assignedCodes = assignedCodesStr ? JSON.parse(assignedCodesStr) : []
      
      // Build query based on user role
      let query = supabase
        .from('sco_customers')
        .select('*')
      
      // If not admin, filter by assigned codes
      if (userRole !== 'admin' && userRole !== 'supervisor' && assignedCodes.length > 0) {
        query = query.in('assignment_code', assignedCodes)
      }
      
      // Apply sorting
      const { data: customersData, error: customersError } = await query
        .order('net_value', { ascending: false, nullsFirst: false }) // Highest value first
        .order('last_purchase_date', { ascending: true, nullsFirst: true }) // Then oldest
        .limit(200)

      if (customersError) throw customersError

      // Fetch call outcomes
      const customerIds = customersData?.map(c => c.id) || []
      const { data: callsData } = await supabase
        .from('sco_call_outcomes')
        .select('*')
        .in('customer_id', customerIds)
        .order('created_at', { ascending: false })

      // Group calls by customer
      const callsByCustomer = (callsData || []).reduce((acc, call) => {
        if (!acc[call.customer_id]) acc[call.customer_id] = []
        acc[call.customer_id].push(call)
        return acc
      }, {} as Record<string, any[]>)

      // Convert to frontend format
      const formattedCustomers: Customer[] = (customersData || []).map(customer => {
        const calls = callsByCustomer[customer.id] || []
        const lastCall = calls[0]
        
        let status: 'pending' | 'callback' | 'completed' = 'pending'
        let result: string | null = null
        let callbackDate: string | null = null
        let comments = ''

        if (lastCall) {
          // Use the actual column names from database
          if (lastCall.call_status === 'callback' && lastCall.callback_date) {
            status = 'callback'
            callbackDate = lastCall.callback_date
            result = lastCall.outcome || 'Callback scheduled'
          } else if (['completed', 'not_interested', 'wrong_number'].includes(lastCall.call_status)) {
            status = 'completed'
            result = lastCall.outcome || lastCall.call_status.replace('_', ' ')
          } else if (lastCall.call_status === 'busy' || lastCall.call_status === 'no_answer') {
            // These should trigger a callback for tomorrow
            status = 'callback'
            result = lastCall.outcome || 'No Answer / Busy'
            callbackDate = lastCall.callback_date
          }
          comments = lastCall.comments || ''
        }

        return {
          id: customer.id,
          name: customer.customer_name,
          phone: customer.mobile_no,
          city: customer.city,
          status,
          result,
          callbackDate,
          comments,
          // Additional fields for display
          netValue: customer.net_value,
          currency: customer.currency,
          lastPurchaseDate: customer.last_purchase_date,
          noOfPurchases: customer.no_of_purchases,
          contactPerson: customer.contact_person,
          salesType: customer.sales_type,
          province: customer.province_emirate,
          country: customer.country_full
        }
      })

      setCustomers(formattedCustomers)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter customers based on view
  const filteredCustomers = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    
    if (view === 'pending') {
      return customers.filter(c => c.status === 'pending')
    } else {
      return customers.filter(c => 
        c.status === 'callback' && 
        c.callbackDate && 
        c.callbackDate <= today
      )
    }
  }, [customers, view])

  const currentCustomer = filteredCustomers[currentIndex] || null


  const handleStatusChange = async (data: {
    status?: 'pending' | 'callback' | 'completed'
    result?: string | null
    callbackDate?: string | null
    comments?: string
  }) => {
    if (!currentCustomer) return

    try {
      // Map frontend status to database status
      // Valid enum values: pending, completed, callback, no_answer, busy, wrong_number, not_interested
      let dbStatus = 'pending'
      
      // Check result string more carefully (case-insensitive)
      const resultLower = data.result?.toLowerCase() || ''
      
      if (resultLower.includes('interested') && !resultLower.includes('not')) {
        // Mark as completed for interested customers
        dbStatus = 'completed'
      } else if (resultLower.includes('not interested')) {
        dbStatus = 'not_interested'
      } else if (resultLower.includes('wrong') || resultLower.includes('do not call')) {
        dbStatus = 'wrong_number'
      } else if (resultLower.includes('busy') || resultLower.includes('no answer')) {
        dbStatus = 'busy'
      } else if (data.status === 'callback' || resultLower.includes('callback')) {
        dbStatus = 'callback'
      } else if (data.status === 'completed') {
        dbStatus = 'completed'
      }

      // Get user ID from localStorage
      const userId = localStorage.getItem('userId') || 'a2b84473-3c78-406a-8205-8e476cb92874'
      
      // Insert call outcome - using actual column names from database
      const { error } = await supabase
        .from('sco_call_outcomes')
        .insert({
          customer_id: currentCustomer.id,
          user_id: userId,
          call_status: dbStatus, // Maps to the call_status enum column
          outcome: data.result || null,
          comments: data.comments || currentCustomer.comments || '',
          callback_date: data.callbackDate || null,
          call_duration: null // Will be null for now
        })

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      // Update local state
      setCustomers(prev => prev.map(c => 
        c.id === currentCustomer.id
          ? { ...c, ...data }
          : c
      ))

      // Move to next customer if completed
      if (data.status === 'completed') {
        setTimeout(() => {
          setCurrentIndex(prev => Math.min(prev + 1, filteredCustomers.length - 1))
        }, 500)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to save call outcome. Please try again.')
    }
  }

  const handleCommentsChange = (value: string) => {
    if (!currentCustomer) return

    setCustomers(prev => prev.map(c => 
      c.id === currentCustomer.id
        ? { ...c, comments: value }
        : c
    ))
  }

  const handleCommentsSave = async () => {
    if (!currentCustomer) return

    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem('userId') || 'a2b84473-3c78-406a-8205-8e476cb92874'
      
      // Save comments to database without changing status
      const { error } = await supabase
        .from('sco_call_outcomes')
        .insert({
          customer_id: currentCustomer.id,
          user_id: userId,
          call_status: 'pending', // Keep as pending since we're just saving comments
          outcome: 'Comments saved',
          comments: currentCustomer.comments || '',
          callback_date: null,
          call_duration: null
        })

      if (error) {
        console.error('Error saving comments:', error)
        alert('Failed to save comments. Please try again.')
      }
    } catch (error) {
      console.error('Error saving comments:', error)
      alert('Failed to save comments. Please try again.')
    }
  }

  // Update AppTopbar's FilterTabs
  const handleViewChange = (newView: 'pending' | 'callbacks') => {
    setView(newView)
    setCurrentIndex(0) // Reset to first customer when switching views
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-[#636E72]">Loading customers...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Professional Filter Tabs */}
      <div className="flex justify-center">
        <div className="flex gap-2 bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-[#e3d8eb]">
          <button
            onClick={() => handleViewChange('pending')}
            className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform ${
              view === 'pending'
                ? 'bg-gradient-to-r from-[#886baa] to-[#543b73] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                : 'text-[#8a4a62] hover:text-[#543b73] hover:bg-[#e3d8eb]/50 hover:shadow-md'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              New Customers
              <span className="text-sm opacity-80">/ عملاء جدد</span>
            </span>
            {view === 'pending' && (
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            )}
          </button>
          <button
            onClick={() => handleViewChange('callbacks')}
            className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform ${
              view === 'callbacks'
                ? 'bg-gradient-to-r from-[#e17553] to-[#8a4a62] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                : 'text-[#8a4a62] hover:text-[#543b73] hover:bg-[#e3d8eb]/50 hover:shadow-md'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Today&apos;s Callbacks
              <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs font-bold">
                {customers.filter(c => c.status === 'callback' && c.callbackDate === new Date().toISOString().split('T')[0]).length}
              </span>
              <span className="text-sm opacity-80">/ مكالمات اليوم</span>
            </span>
            {view === 'callbacks' && (
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            )}
          </button>
        </div>
      </div>

      <CustomerCard
        customer={currentCustomer}
        view={view}
        onStatusChange={handleStatusChange}
        onCommentsChange={handleCommentsChange}
        onCommentsSave={handleCommentsSave}
      />
    </div>
  )
}