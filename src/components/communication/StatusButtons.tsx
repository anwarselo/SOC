'use client'

import { useState } from 'react'
import { CallbackDialog } from '../workflow-orchestration/CallbackDialog'
import { ConfirmDialog } from '../workflow-orchestration/ConfirmDialog'

interface StatusButtonsProps {
  onAction: (data: {
    status: 'completed' | 'callback'
    result: string
    callbackDate: string | null
  }) => void
}

export function StatusButtons({ onAction }: StatusButtonsProps) {
  const [showCallbackDialog, setShowCallbackDialog] = useState(false)
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

  const handleComplete = (result: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `Confirm: ${result}`,
      message: `Are you sure you want to mark this customer as "${result}"? This action will complete the call.`,
      action: () => {
        onAction({
          status: 'completed',
          result,
          callbackDate: null
        })
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }

  const handleNoAnswer = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm: No Answer/Busy',
      message: `This will automatically schedule a callback for tomorrow (${tomorrow.toLocaleDateString()}). Continue?`,
      action: () => {
        onAction({
          status: 'callback',
          result: 'No Answer / Busy',
          callbackDate: tomorrow.toISOString().split('T')[0]
        })
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }

  const handleCallback = (date: string) => {
    onAction({
      status: 'callback',
      result: 'Scheduled Callback',
      callbackDate: date
    })
    setShowCallbackDialog(false)
  }

  return (
    <>
      <div className="space-y-2">
        {/* First row - 4 buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleNoAnswer}
            className="action-button px-3 py-3 border-2 border-[#9E9E9E]  bg-[#F5F5F5] hover:bg-[#EEEEEE] text-[#2D3436] font-medium transition-all duration-200 hover:shadow-sm active:scale-[0.98]"
          >
            <div className="text-center">
              <div className="text-sm">📞 No Answer/Busy</div>
              <div className="text-xs text-[#636E72] mt-1">لا يجيب/مشغول</div>
              <div className="text-[10px] text-[#95A5A6] mt-1">(Auto retry tomorrow)</div>
            </div>
          </button>
          <button
            onClick={() => setShowCallbackDialog(true)}
            className="action-button px-3 py-3 border-2 border-[#FFB74D]  bg-[#FFF3E0] hover:bg-[#FFE8CC] text-[#2D3436] font-medium transition-all duration-200 hover:shadow-sm active:scale-[0.98]"
          >
            <div className="text-center">
              <div className="text-sm">📅 Schedule Callback</div>
              <div className="text-xs text-[#636E72] mt-1">جدولة اتصال</div>
              <div className="text-[10px] text-[#95A5A6] mt-1">(Pick date/time)</div>
            </div>
          </button>
          <button
            onClick={() => handleComplete('Interested')}
            className="action-button px-3 py-3 border-2 border-[#4CAF50]  bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2D3436] font-medium transition-all duration-200 hover:shadow-sm active:scale-[0.98]"
          >
            <div className="text-center">
              <div className="text-sm">✅ Interested</div>
              <div className="text-xs text-[#636E72] mt-1">مهتم</div>
              <div className="text-[10px] text-[#95A5A6] mt-1">(Add notes)</div>
            </div>
          </button>
          <button
            onClick={() => handleComplete('Not Interested')}
            className="action-button px-3 py-3 border-2 border-[#FF9800]  bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#2D3436] font-medium transition-all duration-200 hover:shadow-sm active:scale-[0.98]"
          >
            <div className="text-center">
              <div className="text-sm">❌ Not Interested</div>
              <div className="text-xs text-[#636E72] mt-1">غير مهتم</div>
              <div className="text-[10px] text-[#95A5A6] mt-1">(Mark complete)</div>
            </div>
          </button>
        </div>
        
        {/* Second row - 1 button centered */}
        <div className="flex justify-center">
          <button
            onClick={() => handleComplete('Wrong Number / Do Not Call')}
            className="action-button px-6 py-3 border-2 border-[#F44336]  bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#2D3436] font-medium transition-all duration-200 hover:shadow-sm active:scale-[0.98] w-1/3"
          >
            <div className="text-center">
              <div className="text-sm">🚫 Wrong Number / Do Not Call</div>
              <div className="text-xs text-[#636E72] mt-1">رقم خاطئ / عدم الاتصال</div>
              <div className="text-[10px] text-[#95A5A6] mt-1">(Never contact again)</div>
            </div>
          </button>
        </div>
      </div>
      {showCallbackDialog && (
        <CallbackDialog
          onSave={handleCallback}
          onCancel={() => setShowCallbackDialog(false)}
        />
      )}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </>
  )
}