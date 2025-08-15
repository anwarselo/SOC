'use client'

import { useState, useEffect, useMemo } from 'react'
import { CustomerCardSimple } from '@/components/CustomerCardSimple'
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
      }, {} as Record<string, unknown[]>)

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
      {/* Simplified Filter Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleViewChange('pending')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              view === 'pending'
                ? 'bg-[#886baa] text-white shadow-sm'
                : 'text-gray-600 hover:bg-white hover:shadow-sm'
            }`}
          >
            New Customers
          </button>
          <button
            onClick={() => handleViewChange('callbacks')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              view === 'callbacks'
                ? 'bg-[#886baa] text-white shadow-sm'
                : 'text-gray-600 hover:bg-white hover:shadow-sm'
            }`}
          >
            Today&apos;s Callbacks ({customers.filter(c => c.status === 'callback' && c.callbackDate === new Date().toISOString().split('T')[0]).length})
          </button>
        </div>
      </div>

      <CustomerCardSimple
        customer={currentCustomer}
        view={view}
        onStatusChange={handleStatusChange}
        onCommentsChange={handleCommentsChange}
        onCommentsSave={handleCommentsSave}
      />
    </div>
  )
}