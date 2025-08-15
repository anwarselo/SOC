'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface SalespersonStats {
  id: string
  name: string
  sedarNumber: string
  assignedCodes: string[]
  totalCustomers: number
  callsMade: number
  completed: number
  callbacks: number
  interested: number
  notInterested: number
}

interface AssignmentCode {
  code: string
  customerCount: number
  assignedTo: string | null
}

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

export default function AdminDashboard() {
  const [salespeople, setSalespeople] = useState<SalespersonStats[]>([])
  const [assignmentCodes, setAssignmentCodes] = useState<AssignmentCode[]>([])
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('')
  const [selectedCode, setSelectedCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'reports'>('overview')
  
  // Reports state
  const [reportsSalespeople, setReportsSalespeople] = useState<User[]>([])
  const [selectedReportSalesperson, setSelectedReportSalesperson] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [callOutcomes, setCallOutcomes] = useState<CallOutcome[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const router = useRouter()

  const initializeReports = useCallback(() => {
    // Set default dates to current month for reports
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
    fetchReportsSalespeople()
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch salespeople
      const { data: usersData } = await supabase
        .from('sco_users')
        .select('*')
        .eq('role', 'agent')

      // Fetch assignment codes and their counts
      const { data: codesData } = await supabase
        .from('sco_customers')
        .select('assignment_code')
        .not('assignment_code', 'is', null)

      // Group by assignment code
      const codeGroups = codesData?.reduce((acc, curr) => {
        const code = curr.assignment_code
        if (!acc[code]) acc[code] = 0
        acc[code]++
        return acc
      }, {} as Record<string, number>)

      // Fetch call statistics for each salesperson
      const salespeopleStats: SalespersonStats[] = []
      
      for (const user of usersData || []) {
        // Get customers assigned to this salesperson's codes
        const { data: customerCount } = await supabase
          .from('sco_customers')
          .select('id', { count: 'exact' })
          .in('assignment_code', user.assigned_codes || [])

        // Get call outcomes for this salesperson
        const { data: callsData } = await supabase
          .from('sco_call_outcomes')
          .select('call_status, outcome')
          .eq('user_id', user.id)

        const stats = callsData?.reduce((acc, call) => {
          if (call.call_status === 'completed') acc.completed++
          if (call.call_status === 'callback') acc.callbacks++
          if (call.outcome?.toLowerCase().includes('interested') && !call.outcome?.toLowerCase().includes('not')) acc.interested++
          if (call.outcome?.toLowerCase().includes('not interested')) acc.notInterested++
          return acc
        }, { completed: 0, callbacks: 0, interested: 0, notInterested: 0 })

        salespeopleStats.push({
          id: user.id,
          name: user.full_name,
          sedarNumber: user.sedar_number,
          assignedCodes: user.assigned_codes || [],
          totalCustomers: customerCount?.length || 0,
          callsMade: callsData?.length || 0,
          completed: stats?.completed || 0,
          callbacks: stats?.callbacks || 0,
          interested: stats?.interested || 0,
          notInterested: stats?.notInterested || 0
        })
      }

      setSalespeople(salespeopleStats)
      
      // Convert code groups to array
      const codes = Object.entries(codeGroups || {}).map(([code, count]) => {
        const assignedUser = usersData?.find(u => u.assigned_codes?.includes(code))
        return {
          code,
          customerCount: count,
          assignedTo: assignedUser?.full_name || null
        }
      })
      setAssignmentCodes(codes)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Check if user is admin
    const role = localStorage.getItem('userRole')
    if (role !== 'admin' && role !== 'supervisor') {
      router.push('/app/calls')
      return
    }

    fetchDashboardData()
    initializeReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDashboardData, initializeReports])

  // Fetch reports salespeople when switching to reports tab
  useEffect(() => {
    if (activeTab === 'reports' && reportsSalespeople.length === 0) {
      fetchReportsSalespeople()
    }
  }, [activeTab, reportsSalespeople.length])

  const handleAssignCode = async () => {
    if (!selectedSalesperson || !selectedCode) return

    try {
      // Update the user's assigned codes
      const { data: userData } = await supabase
        .from('sco_users')
        .select('assigned_codes')
        .eq('id', selectedSalesperson)
        .single()

      const currentCodes = userData?.assigned_codes || []
      if (!currentCodes.includes(selectedCode)) {
        const { error } = await supabase
          .from('sco_users')
          .update({ 
            assigned_codes: [...currentCodes, selectedCode] 
          })
          .eq('id', selectedSalesperson)

        if (!error) {
          alert('Assignment successful!')
          fetchDashboardData()
          setSelectedCode('')
          setSelectedSalesperson('')
        }
      }
    } catch (error) {
      console.error('Error assigning code:', error)
      alert('Failed to assign code')
    }
  }

  // Reports functions
  const fetchReportsSalespeople = async () => {
    try {
      console.log('Fetching reports salespeople...')
      const { data, error } = await supabase
        .from('sco_users')
        .select('id, sedar_number, full_name, role')

      console.log('Raw reports data:', { data, error })

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      if (!data || data.length === 0) {
        console.log('No users found for reports')
        setReportsSalespeople([])
        return
      }

      // Filter out admins - only include agents/salespeople
      const salespeople = data?.filter(user => 
        user.role && !['admin', 'supervisor'].includes(user.role)
      ) || []

      console.log('Filtered salespeople for reports:', salespeople)
      setReportsSalespeople(salespeople)
    } catch (error) {
      console.error('Error fetching salespeople:', error)
    }
  }

  const handleSearch = async () => {
    if (!selectedReportSalesperson || !startDate || !endDate) {
      alert('Please select salesperson and date range')
      return
    }

    setReportsLoading(true)
    setSearchPerformed(true)

    try {
      // First, get the call outcomes
      const { data: callsData, error: callsError } = await supabase
        .from('sco_call_outcomes')
        .select('*')
        .eq('user_id', selectedReportSalesperson)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: false })

      if (callsError) {
        console.error('Error fetching calls:', callsError)
        throw callsError
      }

      if (!callsData || callsData.length === 0) {
        setCallOutcomes([])
        return
      }

      // Get unique customer IDs
      const customerIds = [...new Set(callsData.map(call => call.customer_id))]
      
      // Fetch customer details
      const { data: customersData } = await supabase
        .from('sco_customers')
        .select('id, customer_name, mobile_no')
        .in('id', customerIds)

      // Get salesperson name
      const { data: userData } = await supabase
        .from('sco_users')
        .select('full_name')
        .eq('id', selectedReportSalesperson)
        .single()

      // Create lookup maps
      const customerMap = (customersData || []).reduce((acc, customer) => {
        acc[customer.id] = customer
        return acc
      }, {} as Record<string, { id: string; customer_name: string; mobile_no: string }>)

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

      setCallOutcomes(formattedData)
    } catch (error) {
      console.error('Error fetching call outcomes:', error)
      alert('Error fetching reports. Please try again.')
    } finally {
      setReportsLoading(false)
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


  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-[#636E72]">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-gradient-to-r from-[#e3d8eb]/30 to-[#c7b1d7]/20 backdrop-blur-sm border border-[#e3d8eb] rounded-2xl shadow-lg shadow-[#886baa]/10 p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#886baa] to-[#543b73] text-white shadow-lg'
                : 'bg-white/80 border border-[#e3d8eb] text-[#8a4a62] hover:bg-white hover:shadow-md'
            }`}
          >
            Overview / نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'assignments'
                ? 'bg-gradient-to-r from-[#886baa] to-[#543b73] text-white shadow-lg'
                : 'bg-white/80 border border-[#e3d8eb] text-[#8a4a62] hover:bg-white hover:shadow-md'
            }`}
          >
            Assignments / التعيينات
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-[#886baa] to-[#543b73] text-white shadow-lg'
                : 'bg-white/80 border border-[#e3d8eb] text-[#8a4a62] hover:bg-white hover:shadow-md'
            }`}
          >
            Reports / التقارير
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#543b73] to-[#8a4a62] bg-clip-text text-transparent mb-4">Salesperson Performance</h2>
            <div className="grid gap-4">
              {salespeople.map(sp => (
                <div key={sp.id} className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#e3d8eb] shadow-lg shadow-[#886baa]/10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#543b73]">{sp.name}</h3>
                      <p className="text-sm text-[#a97e9d] font-medium">Sedar: {sp.sedarNumber}</p>
                      <p className="text-xs text-[#8a4a62]">Assigned: {sp.assignedCodes.join(', ') || 'None'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#886baa]">{sp.callsMade}</p>
                      <p className="text-xs text-[#a97e9d]">Total Calls</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="bg-gradient-to-br from-[#e3d8eb] to-[#c7b1d7]/50 rounded-lg p-2">
                      <p className="text-lg font-bold text-[#543b73]">{sp.totalCustomers}</p>
                      <p className="text-xs text-[#8a4a62]">Customers</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-emerald-600">{sp.completed}</p>
                      <p className="text-xs text-[#8a4a62]">Completed</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-orange-600">{sp.callbacks}</p>
                      <p className="text-xs text-[#8a4a62]">Callbacks</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#e17553]/20 to-[#8a4a62]/10 rounded-lg p-2">
                      <p className="text-lg font-bold text-[#e17553]">{sp.interested}</p>
                      <p className="text-xs text-[#8a4a62]">Interested</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-red-600">{sp.notInterested}</p>
                      <p className="text-xs text-[#8a4a62]">Not Interested</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#543b73] to-[#8a4a62] bg-clip-text text-transparent mb-4">Manage Assignments</h2>
            
            {/* Assignment Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#e3d8eb] shadow-lg shadow-[#886baa]/10 p-6">
              <h3 className="text-lg font-bold text-[#543b73] mb-4">Assign Code to Salesperson</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#543b73] mb-2">
                    Select Code
                  </label>
                  <select
                    value={selectedCode}
                    onChange={(e) => setSelectedCode(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e3d8eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#886baa]/50 focus:border-[#886baa] bg-white/80"
                  >
                    <option value="">Choose a code...</option>
                    {assignmentCodes.map(code => (
                      <option key={code.code} value={code.code}>
                        {code.code} ({code.customerCount} customers)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#543b73] mb-2">
                    Select Salesperson
                  </label>
                  <select
                    value={selectedSalesperson}
                    onChange={(e) => setSelectedSalesperson(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e3d8eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#886baa]/50 focus:border-[#886baa] bg-white/80"
                  >
                    <option value="">Choose a salesperson...</option>
                    {salespeople.map(sp => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name} ({sp.sedarNumber})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={handleAssignCode}
                    disabled={!selectedCode || !selectedSalesperson}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      selectedCode && selectedSalesperson
                        ? 'bg-gradient-to-r from-[#886baa] to-[#543b73] text-white hover:from-[#8a4a62] hover:to-[#543b73] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Assign / تعيين
                  </button>
                </div>
              </div>
            </div>

            {/* Current Assignments */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#e3d8eb] shadow-lg shadow-[#886baa]/10 p-6">
              <h3 className="text-lg font-bold text-[#543b73] mb-4">Current Assignments</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#e3d8eb]">
                      <th className="text-left py-2 px-3 text-sm font-medium text-[#8a4a62]">Code</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-[#8a4a62]">Customers</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-[#8a4a62]">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentCodes.map(code => (
                      <tr key={code.code} className="border-b border-[#e3d8eb]/50 hover:bg-[#e3d8eb]/20 transition-colors">
                        <td className="py-2 px-3 font-mono text-sm text-[#543b73]">{code.code}</td>
                        <td className="py-2 px-3 text-sm text-[#543b73]">{code.customerCount}</td>
                        <td className="py-2 px-3 text-sm text-[#543b73]">
                          {code.assignedTo || <span className="text-[#e17553] font-medium">Unassigned</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
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
                    value={selectedReportSalesperson}
                    onChange={(e) => setSelectedReportSalesperson(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-[#e3d8eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#886baa]/50 focus:border-[#886baa] text-[#543b73]"
                    required
                  >
                    <option value="">Select Salesperson ({reportsSalespeople.length} available)</option>
                    {reportsSalespeople.map(person => (
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
                  disabled={reportsLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#886baa] to-[#543b73] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#8a4a62] hover:to-[#543b73] transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reportsLoading ? (
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
        )}

      </div>
    </div>
  )
}