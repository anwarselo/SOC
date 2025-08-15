'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CallOutcome {
  id: string
  customer_id: string
  user_id: string
  call_status: string
  outcome: string | null
  comments: string | null
  callback_date: string | null
  created_at: string
  customer_name: string
  customer_phone: string
  salesperson_name: string
}

interface User {
  id: string
  sedar_number: string
  full_name: string
  role: string
}

export default function ReportsPage() {
  const [salespeople, setSalespeople] = useState<User[]>([])
  const [selectedSalesperson, setSelectedSalesperson] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [callOutcomes, setCallOutcomes] = useState<CallOutcome[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)

  useEffect(() => {
    fetchSalespeople()
    // Set default dates to current month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

  const fetchSalespeople = async () => {
    try {
      // Get all users from the database
      const { data, error } = await supabase
        .from('sco_users')
        .select('id, sedar_number, full_name, role')

      console.log('Raw database response:', { data, error })

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      if (!data || data.length === 0) {
        console.log('No users found in database')
        setSalespeople([])
        return
      }

      console.log('Found users:', data)
      
      // Filter out admins - only include agents/salespeople
      const salespeople = data.filter(user => 
        user.role && !['admin', 'supervisor'].includes(user.role)
      )

      console.log('Filtered salespeople (no admins):', salespeople)
      setSalespeople(salespeople)
    } catch (error) {
      console.error('Error fetching salespeople:', error)
    }
  }

  const handleSearch = async () => {
    if (!selectedSalesperson || !startDate || !endDate) {
      alert('Please select salesperson and date range')
      return
    }

    setLoading(true)
    setSearchPerformed(true)

    try {
      console.log('Searching for calls:', { selectedSalesperson, startDate, endDate })
      
      // First, get the call outcomes
      const { data: callsData, error: callsError } = await supabase
        .from('sco_call_outcomes')
        .select('*')
        .eq('user_id', selectedSalesperson)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: false })

      console.log('Calls query result:', { callsData, callsError })

      if (callsError) {
        console.error('Error fetching calls:', callsError)
        throw callsError
      }

      if (!callsData || callsData.length === 0) {
        console.log('No calls found for the criteria')
        setCallOutcomes([])
        return
      }

      // Get unique customer IDs
      const customerIds = [...new Set(callsData.map(call => call.customer_id))]
      
      // Fetch customer details
      const { data: customersData, error: customersError } = await supabase
        .from('sco_customers')
        .select('id, customer_name, mobile_no')
        .in('id', customerIds)

      console.log('Customers query result:', { customersData, customersError })

      // Get salesperson name
      const { data: userData, error: userError } = await supabase
        .from('sco_users')
        .select('full_name')
        .eq('id', selectedSalesperson)
        .single()

      console.log('User query result:', { userData, userError })

      // Create lookup maps
      const customerMap = (customersData || []).reduce((acc, customer) => {
        acc[customer.id] = customer
        return acc
      }, {} as Record<string, any>)

      const salespersonName = userData?.full_name || 'Unknown'

      // Format the data
      const formattedData: CallOutcome[] = callsData.map(call => ({
        id: call.id,
        customer_id: call.customer_id,
        user_id: call.user_id,
        call_status: call.call_status,
        outcome: call.outcome,
        comments: call.comments,
        callback_date: call.callback_date,
        created_at: call.created_at,
        customer_name: customerMap[call.customer_id]?.customer_name || 'Unknown',
        customer_phone: customerMap[call.customer_id]?.mobile_no || '',
        salesperson_name: salespersonName
      }))

      console.log('Formatted data:', formattedData)
      setCallOutcomes(formattedData)
    } catch (error) {
      console.error('Error fetching call outcomes:', error)
      alert('Error fetching reports. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '—'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('971')) {
      const number = cleaned.substring(3)
      if (number.length >= 9) {
        return `+971 (0) ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
      }
    }
    return phone
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'callback': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'not_interested': return 'bg-red-100 text-red-800 border-red-200'
      case 'wrong_number': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'no_answer': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <div className="bg-white rounded-2xl border border-[#e3d8eb] shadow-lg p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-white p-3 rounded-xl shadow-md border border-[#e3d8eb]">
            <svg className="w-8 h-8 text-[#886baa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4m-6 0a2 2 0 002 2h2a2 2 0 002-2V9a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#543b73]">
              Generate Report
            </h2>
            <p className="text-[#a97e9d] font-medium">Select criteria to view call history</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Salesperson Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#543b73]">
              Salesperson
            </label>
            <select
              value={selectedSalesperson}
              onChange={(e) => setSelectedSalesperson(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-[#e3d8eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#886baa]/50 focus:border-[#886baa] text-[#543b73]"
              required
            >
              <option value="">Select Salesperson</option>
              {salespeople.map(person => (
                <option key={person.id} value={person.id}>
                  {person.full_name} ({person.sedar_number})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#543b73]">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-[#e3d8eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#886baa]/50 focus:border-[#886baa] text-[#543b73]"
              required
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#543b73]">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-[#e3d8eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#886baa]/50 focus:border-[#886baa] text-[#543b73]"
              required
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#886baa] to-[#543b73] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#8a4a62] hover:to-[#543b73] transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Generate Report
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {searchPerformed && (
        <div className="bg-white rounded-2xl border border-[#e3d8eb] shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#543b73]">
                Call History Results
              </h3>
              <p className="text-[#a97e9d]">
                Found {callOutcomes.length} call(s) for selected criteria
              </p>
            </div>
            {callOutcomes.length > 0 && (
              <button
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8," + 
                    "Date,Customer Name,Phone,Status,Outcome,Comments\n" +
                    callOutcomes.map(call => 
                      `"${formatDate(call.created_at)}","${call.customer_name}","${formatPhoneNumber(call.customer_phone)}","${call.call_status}","${call.outcome || ''}","${call.comments || ''}"`
                    ).join("\n")
                  
                  const encodedUri = encodeURI(csvContent)
                  const link = document.createElement("a")
                  link.setAttribute("href", encodedUri)
                  link.setAttribute("download", `sales-report-${startDate}-to-${endDate}.csv`)
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                className="px-4 py-2 bg-[#e17553] text-white rounded-lg font-semibold hover:bg-[#8a4a62] transition-colors"
              >
                Export CSV
              </button>
            )}
          </div>

          {callOutcomes.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-[#c7b1d7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-[#a97e9d] text-lg">No call records found for the selected criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#e3d8eb]">
                    <th className="text-left py-3 px-4 font-semibold text-[#543b73]">Date & Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#543b73]">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#543b73]">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#543b73]">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#543b73]">Outcome</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#543b73]">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {callOutcomes.map((call) => (
                    <tr key={call.id} className="border-b border-[#e3d8eb]/50 hover:bg-[#e3d8eb]/20 transition-colors">
                      <td className="py-3 px-4 text-[#543b73] font-medium">
                        {formatDate(call.created_at)}
                      </td>
                      <td className="py-3 px-4 text-[#543b73] font-semibold">
                        {call.customer_name}
                      </td>
                      <td className="py-3 px-4 text-[#8a4a62] font-mono text-sm">
                        {formatPhoneNumber(call.customer_phone)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(call.call_status)}`}>
                          {call.call_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#543b73]">
                        {call.outcome || '—'}
                      </td>
                      <td className="py-3 px-4 text-[#8a4a62] text-sm max-w-xs truncate">
                        {call.comments || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}