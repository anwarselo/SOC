'use client'

import { useState, useEffect, useCallback } from 'react'

interface ErrorReport {
  id: string
  error_type: string
  page_url: string
  error_message: string
  created_at: string
  resolved: boolean
  sco_users: { full_name: string; sedar_number: string } | null
}

export default function ErrorReportsPage() {
  const [reports, setReports] = useState<ErrorReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved')

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      const resolved = filter === 'all' ? null : filter === 'resolved'
      const response = await fetch(`/api/support/report?resolved=${resolved}&limit=100`)
      const data = await response.json()
      
      if (data.reports) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error('Failed to fetch error reports:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'manual_report': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'nextjs_error': return 'bg-red-100 text-red-800 border-red-200'
      case 'javascript_error': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'api_error': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#543b73]">Error Reports</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-[#a97e9d]">Loading error reports...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#543b73]">Error Reports</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2  font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#886baa] text-white'
                : 'bg-white text-[#543b73] border border-[#e3d8eb] hover:bg-[#e3d8eb]/50'
            }`}
          >
            All ({reports.length})
          </button>
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-4 py-2  font-medium transition-colors ${
              filter === 'unresolved'
                ? 'bg-[#e17553] text-white'
                : 'bg-white text-[#543b73] border border-[#e3d8eb] hover:bg-[#e3d8eb]/50'
            }`}
          >
            Unresolved
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2  font-medium transition-colors ${
              filter === 'resolved'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-[#543b73] border border-[#e3d8eb] hover:bg-[#e3d8eb]/50'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white  border border-[#e3d8eb] shadow-lg p-12 text-center">
          <svg className="w-16 h-16 text-[#c7b1d7] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-[#a97e9d] text-lg">No error reports found</p>
        </div>
      ) : (
        <div className="bg-white  border border-[#e3d8eb] shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#e3d8eb]/30">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-[#543b73]">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-[#543b73]">Type</th>
                  <th className="text-left py-4 px-6 font-semibold text-[#543b73]">Page</th>
                  <th className="text-left py-4 px-6 font-semibold text-[#543b73]">Error</th>
                  <th className="text-left py-4 px-6 font-semibold text-[#543b73]">User</th>
                  <th className="text-left py-4 px-6 font-semibold text-[#543b73]">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-[#e3d8eb]/50 hover:bg-[#e3d8eb]/10 transition-colors">
                    <td className="py-4 px-6 text-[#543b73] font-medium">
                      {formatDate(report.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1  text-xs font-semibold border ${getErrorTypeColor(report.error_type)}`}>
                        {report.error_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#8a4a62] font-mono text-sm max-w-xs truncate">
                      {report.page_url}
                    </td>
                    <td className="py-4 px-6 text-[#543b73] max-w-md truncate">
                      {report.error_message || '—'}
                    </td>
                    <td className="py-4 px-6 text-[#8a4a62]">
                      {report.sco_users ? 
                        `${report.sco_users.full_name} (${report.sco_users.sedar_number})` : 
                        'Anonymous'
                      }
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1  text-xs font-semibold ${
                        report.resolved 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {report.resolved ? 'Resolved' : 'Open'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}