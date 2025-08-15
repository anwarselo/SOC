'use client'

import { useState, useEffect } from 'react'
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

export default function AdminDashboard() {
  const [salespeople, setSalespeople] = useState<SalespersonStats[]>([])
  const [assignmentCodes, setAssignmentCodes] = useState<AssignmentCode[]>([])
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('')
  const [selectedCode, setSelectedCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments'>('overview')
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    const role = localStorage.getItem('userRole')
    if (role !== 'admin' && role !== 'supervisor') {
      router.push('/app/calls')
      return
    }

    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
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
  }

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
            onClick={() => router.push('/app/reports')}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-white/80 border border-[#e3d8eb] text-[#8a4a62] hover:bg-white hover:shadow-md"
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

      </div>
    </div>
  )
}