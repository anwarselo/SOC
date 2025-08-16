'use client'

import { useState, useEffect } from 'react'
import { CommentsBox } from '../communication/CommentsBox'
import { ScriptPanel } from './ScriptPanel'
import { EmptyState } from '../workflow-orchestration/EmptyState'
import { ErrorReporter } from '../system-foundation/ErrorReporter'
import { LanguageToggle } from '../user-experience/LanguageToggle'
import { ProductReminder } from './ProductReminder'
import { CallHistory } from './CallHistory'
import { CallbackDialog } from '../workflow-orchestration/CallbackDialog'
import { ConfirmDialog } from '../workflow-orchestration/ConfirmDialog'
import { VoiceRecorder } from '../communication/VoiceRecorder'
import { supabase } from '@/lib/supabase'

interface Customer {
  id: string
  name: string
  phone?: string
  city?: string
  status: 'pending' | 'callback' | 'completed'
  result: string | null
  callbackDate: string | null
  comments: string
  // Additional fields
  netValue?: number | null
  currency?: string
  lastPurchaseDate?: string | null
  noOfPurchases?: number
  contactPerson?: string | null
  salesType?: string
  province?: string
  country?: string
}

interface StatusChangeData {
  status?: 'pending' | 'callback' | 'completed'
  result?: string | null
  callbackDate?: string | null
  comments?: string
}

interface CustomerCardCleanProps {
  customer: Customer | null
  view?: 'pending' | 'callbacks'
  onStatusChange: (data: StatusChangeData) => void
  onCommentsChange: (value: string) => void
  onCommentsSave?: () => void
}

export function CustomerCardClean({
  customer,
  view = 'pending',
  onStatusChange,
  onCommentsChange,
  onCommentsSave
}: CustomerCardCleanProps) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const [showHistory, setShowHistory] = useState(false)
  const [showCallbackDialog, setShowCallbackDialog] = useState(false)
  const [salespersonName, setSalespersonName] = useState<string>('')
  const [showInterestedDialog, setShowInterestedDialog] = useState(false)
  const [interestedComments, setInterestedComments] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    action: () => void
    title: string
    message: string
  }>({
    isOpen: false,
    action: () => {},
    title: '',
    message: ''
  })

  // Get salesperson name from database on component mount
  useEffect(() => {
    const fetchSalespersonName = async () => {
      if (typeof window !== 'undefined') {
        // Get user name from localStorage (set during BetterAuth login)
        const userName = localStorage.getItem('userName') || 'Sales Representative'
        setSalespersonName(userName)
      }
    }
    
    fetchSalespersonName()
  }, [])

  if (!customer) {
    return <EmptyState view={view} />
  }

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'en' ? 'ar' : 'en'
      console.log('Language toggled from', prev, 'to', newLang)
      return newLang
    })
  }

  const handleComplete = (result: string) => {
    // Special handling for "Interested" - require comments
    if (result === 'Interested') {
      setInterestedComments(customer.comments || '') // Pre-fill with existing comments
      setShowInterestedDialog(true)
      return
    }
    
    // Regular confirmation for other results
    setConfirmDialog({
      isOpen: true,
      title: `Confirm: ${result}`,
      message: `Are you sure you want to mark this customer as "${result}"? This action will complete the call.`,
      action: () => {
        onStatusChange({
          status: 'completed',
          result,
          callbackDate: null
        })
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }

  const handleInterestedSave = () => {
    // Check if comments are provided
    if (!interestedComments.trim()) {
      alert('Please add comments explaining why the customer is interested before saving.')
      return
    }

    // Update comments first, then status
    onCommentsChange(interestedComments)
    
    // Save the status change with comments
    onStatusChange({
      status: 'completed',
      result: 'Interested',
      callbackDate: null,
      comments: interestedComments
    })
    
    setShowInterestedDialog(false)
    setInterestedComments('')
  }

  const handleNoAnswer = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm: No Answer/Busy',
      message: `This will automatically schedule a callback for tomorrow (${tomorrow.toLocaleDateString()}). Continue?`,
      action: () => {
        onStatusChange({
          status: 'callback',
          result: 'No Answer / Busy',
          callbackDate: tomorrow.toISOString().split('T')[0]
        })
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }

  const handleCallback = (date: string) => {
    onStatusChange({
      status: 'callback',
      result: 'Scheduled Callback',
      callbackDate: date
    })
    setShowCallbackDialog(false)
  }

  // Format phone number: +971 (0) 56 555 5555
  const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return '—'
    
    const cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.startsWith('971')) {
      const number = cleaned.substring(3)
      if (number.length >= 9) {
        return `+971 (0) ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
      }
    } else if (cleaned.startsWith('0')) {
      const number = cleaned.substring(1)
      if (number.length >= 8) {
        return `+971 (0) ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
      }
    }
    
    return phone
  }

  // Format currency value
  const formatCurrency = (value: number | null | undefined, currency: string | undefined) => {
    if (!value) return '—'
    const formatted = new Intl.NumberFormat('en-US').format(value)
    return `${formatted} ${currency || 'AED'}`
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Customer Info */}
      <div className="bg-white  shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.name}</h1>
            <div className="flex items-center gap-6 text-gray-600 mb-2">
              <span>ID: {customer.id.slice(-8)}</span>
              <span>{formatPhoneNumber(customer.phone)}</span>
              <span>{customer.city}, {customer.province || 'Dubai'}</span>
              <span className="text-lg font-semibold text-[#886baa]">
                {formatCurrency(customer.netValue, customer.currency)}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Contact: {customer.contactPerson || customer.name}</span>
              <span>{customer.salesType || 'RETAIL'}</span>
              <span>{customer.noOfPurchases || 0} orders</span>
              {customer.lastPurchaseDate && (
                <span>Last purchase: {new Date(customer.lastPurchaseDate).toLocaleDateString('en-GB')}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle language={language} onToggle={toggleLanguage} />
            <ErrorReporter />
          </div>
        </div>

        {/* Top Bar with Status and Call History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          
          {/* Customer Status */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Status</h4>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3  ${
                customer.status === 'completed' ? 'bg-green-500' :
                customer.status === 'callback' ? 'bg-orange-500' :
                'bg-gray-400'
              }`}></div>
              <span className="font-medium capitalize text-gray-900">{customer.status}</span>
              {customer.result && (
                <span className="text-sm text-gray-500">- {customer.result}</span>
              )}
            </div>
            {customer.callbackDate && (
              <div className="text-sm text-gray-500 mt-1">
                Callback: {customer.callbackDate}
              </div>
            )}
          </div>

          {/* Call History Toggle */}
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#886baa] transition-colors"
            >
              <span>Call History</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showHistory && (
              <div className="mt-2 max-h-32 overflow-y-auto">
                <CallHistory customerId={customer.id} />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Script and Product Info */}
        <div className="lg:col-span-2 flex flex-col space-y-8">
          
          {/* Script Panel - Match height with notes */}
          <div className="bg-white  shadow-sm border border-gray-200 p-8 flex-1">
            <ScriptPanel 
              status={customer.status} 
              callbackDate={customer.callbackDate || undefined} 
              language={language}
              customerName={customer.name}
              lastPurchaseDate={customer.lastPurchaseDate}
              salespersonName={salespersonName}
            />
          </div>

          {/* Product Reminder - Match height with quick actions */}
          <div className="bg-white  shadow-sm border border-gray-200 p-8 flex-1">
            <ProductReminder language={language} />
          </div>

        </div>

        {/* Right Column - Notes and Actions */}
        <div className="flex flex-col space-y-8">
          
          {/* Call Notes and Recording - Now on top */}
          <div className="bg-white  shadow-sm border border-gray-200 p-6 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Notes & Recording</h3>
            <CommentsBox 
              value={customer.comments} 
              onChange={onCommentsChange}
              onSave={onCommentsSave}
              customerId={customer.id}
            />
            {customer.result === 'Interested' && !customer.comments && (
              <p className="text-sm text-orange-600 mt-3">⚠️ Please add notes for interested customers</p>
            )}
            
            {/* Voice Recording */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <VoiceRecorder 
                customerId={customer.id}
                onRecordingComplete={(url) => {
                  console.log('Recording completed:', url)
                  // You can add logic here to save the recording URL to the database
                }}
              />
            </div>
          </div>

          {/* Quick Actions - Now below notes */}
          {customer.status !== 'completed' && (
            <div className="bg-white  shadow-sm border border-gray-200 p-6 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              {/* Fixed Action Buttons Grid */}
              <div className="space-y-3">
                {/* Row 1: Primary Results */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleComplete('Interested')}
                    className="p-3 border-2 border-green-300  bg-green-50 hover:bg-green-100 text-center transition-colors"
                    title={`Current language: ${language}`}
                  >
                    <div className="font-medium text-lg">
                      {language === 'ar' ? '✅ مهتم' : '✅ Interested'}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {language === 'ar' ? 'Customer wants product' : 'العميل يريد المنتج'}
                    </div>
                  </button>
                  <button
                    onClick={() => handleComplete('Not Interested')}
                    className="p-3 border-2 border-orange-300  bg-orange-50 hover:bg-orange-100 text-center transition-colors"
                  >
                    <div className="font-medium text-lg">
                      {language === 'ar' ? '❌ غير مهتم' : '❌ Not Interested'}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {language === 'ar' ? 'No interest in product' : 'لا اهتمام بالمنتج'}
                    </div>
                  </button>
                </div>

                {/* Row 2: Call Issues */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleNoAnswer}
                    className="p-3 border-2 border-gray-300  bg-gray-50 hover:bg-gray-100 text-center transition-colors"
                  >
                    <div className="font-medium text-lg">
                      {language === 'ar' ? '📞 لا يجيب / مشغول' : '📞 No Answer / Busy'}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {language === 'ar' ? 'Auto retry tomorrow' : 'إعادة محاولة تلقائية غداً'}
                    </div>
                  </button>
                  <button
                    onClick={() => setShowCallbackDialog(true)}
                    className="p-3 border-2 border-blue-300  bg-blue-50 hover:bg-blue-100 text-center transition-colors"
                  >
                    <div className="font-medium text-lg">
                      {language === 'ar' ? '📅 إعادة جدولة' : '📅 Reschedule'}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {language === 'ar' ? 'Pick date and time' : 'اختيار التاريخ والوقت'}
                    </div>
                  </button>
                </div>

                {/* Row 3: Do Not Call */}
                <button
                  onClick={() => handleComplete('Wrong Number / Disconnected / Do Not Call')}
                  className="w-full p-3 border-2 border-red-300  bg-red-50 hover:bg-red-100 text-center transition-colors"
                >
                  <div className="font-medium text-lg">
                    {language === 'ar' ? '🚫 رقم خاطئ / منقطع / عدم الاتصال' : '🚫 Wrong Number / Disconnected / Do Not Call'}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {language === 'ar' ? 'Never contact again' : 'عدم الاتصال مرة أخرى'}
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Dialogs */}
      {showCallbackDialog && (
        <CallbackDialog
          onSave={handleCallback}
          onCancel={() => setShowCallbackDialog(false)}
        />
      )}
      
      {/* Special Interested Dialog with Comments */}
      {showInterestedDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white  p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-[#543b73] mb-4">✅ Customer is Interested</h3>
            <p className="text-gray-600 mb-6">
              Please add notes explaining why the customer is interested. This helps with follow-up and conversion.
            </p>
            
            {/* Comments Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#543b73] mb-2">
                Interest Details & Next Steps
              </label>
              <textarea
                value={interestedComments}
                onChange={(e) => setInterestedComments(e.target.value)}
                placeholder="E.g., Interested in living room curtains, budget 5000 AED, wants consultation next week..."
                className="w-full px-4 py-3 border-2 border-[#e3d8eb]  focus:outline-none focus:ring-2 focus:ring-[#886baa]/50 focus:border-[#886baa] text-[#543b73] resize-none"
                rows={4}
                required
              />
            </div>

            {/* Voice Recording in Dialog */}
            <div className="mb-6 p-4 bg-[#F8FAFA]  border border-[#B8D4D5]">
              <label className="block text-sm font-semibold text-[#543b73] mb-2">
                Optional: Record Voice Note
              </label>
              <VoiceRecorder 
                customerId={customer.id}
                onRecordingComplete={(url) => {
                  console.log('Recording completed:', url)
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInterestedDialog(false)
                  setInterestedComments('')
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300  text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInterestedSave}
                disabled={!interestedComments.trim()}
                className={`flex-1 px-4 py-3  font-semibold transition-colors ${
                  interestedComments.trim()
                    ? 'bg-gradient-to-r from-[#886baa] to-[#543b73] text-white hover:from-[#8a4a62] hover:to-[#543b73] shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Save as Interested
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  )
}