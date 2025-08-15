'use client'

import { useState, useEffect, useRef } from 'react'

interface CallbackDialogProps {
  onSave: (date: string) => void
  onCancel: () => void
}

export function CallbackDialog({ onSave, onCancel }: CallbackDialogProps) {
  const [date, setDate] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus date input on mount
    dateInputRef.current?.focus()

    // Handle ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onCancel])

  const handleSave = () => {
    if (date) {
      onSave(date)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={dialogRef}
        className="bg-[#FAFAF8] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-[#B8D4D5]"
        role="dialog"
        aria-labelledby="dialog-title"
        aria-modal="true"
      >
        <h2 id="dialog-title" className="text-lg font-semibold text-[#2D3436] mb-4">
          Schedule Callback
        </h2>
        
        <div className="bg-[#E3F2FD] border-2 border-[#64B5F6] rounded-lg p-4 mb-4">
          <p className="text-sm text-[#2D3436]">
            Select a date for the callback. The customer will appear in your &quot;Today&apos;s Callbacks&quot; list on that date.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="callback-date" className="block text-sm font-medium text-[#2D3436] mb-2">
            Callback Date
          </label>
          <input
            ref={dateInputRef}
            id="callback-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border-2 border-[#EDEDEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F9EA0] focus:border-[#5F9EA0] bg-[#FAFAF8]"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="action-button px-4 py-2 border-2 border-[#B8D4D5] rounded-lg bg-[#E8F4F5] hover:bg-[#D8E9EA] text-[#2D3436] font-medium transition-all duration-200 hover:shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!date}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm ${
              date
                ? 'bg-gradient-to-r from-[#5F9EA0] to-[#7FB3B5] text-white hover:from-[#4A8789] hover:to-[#5F9EA0] border-2 border-transparent'
                : 'bg-[#EDEDEA] text-[#95A5A6] cursor-not-allowed border-2 border-[#EDEDEA] shadow-inner'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}