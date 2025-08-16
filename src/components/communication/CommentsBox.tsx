'use client'

import { useState } from 'react'
import { VoiceRecorder } from './VoiceRecorder'

interface CommentsBoxProps {
  value: string
  onChange: (value: string) => void
  onSave?: () => void
  customerId?: string
}

export function CommentsBox({ value, onChange, onSave, customerId = 'temp' }: CommentsBoxProps) {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [voiceMemoUrl, setVoiceMemoUrl] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const handleVoiceRecording = (url: string) => {
    setVoiceMemoUrl(url)
    // Add voice memo link to comments
    const voiceMemoText = `\n[Voice Memo: ${new Date().toLocaleString()}]\n${url}\n`
    onChange(value + voiceMemoText)
    setShowVoiceRecorder(false) // Close recorder after saving
    setIsSaved(false) // Mark as unsaved when new content is added
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
      setIsSaved(true)
      // Don't auto-reset - only reset when text changes
    }
  }

  const handleTextChange = (newValue: string) => {
    onChange(newValue)
    setIsSaved(false) // Mark as unsaved when text changes
  }

  return (
    <div>
      <label htmlFor="comments" className="block text-sm font-medium text-[#2D3436] mb-2">
        <span>Comments</span>
        <span className="text-xs text-[#636E72] ml-2">/ ملاحظات</span>
      </label>
      
      <div className="space-y-3">
        {/* Text area always visible */}
        <div className="relative">
          <textarea
            id="comments"
            value={value}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Add notes about this call... / أضف ملاحظات عن هذه المكالمة..."
            className="w-full px-3 py-2 border border-[#EDEDEA]  focus:outline-none focus:ring-2 focus:ring-[#5F9EA0] min-h-[100px] resize-y"
          />
          {/* Save button */}
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSave}
              disabled={!value.trim()}
              className={`px-4 py-2  font-medium transition-all flex items-center gap-2 ${
                isSaved
                  ? 'bg-green-100 border-2 border-green-300 text-green-700'
                  : value.trim()
                  ? 'bg-gradient-to-r from-[#E8F4F5] to-[#D8E9EA] border-2 border-[#5F9EA0] text-[#2D3436] hover:from-[#D8E9EA] hover:to-[#C8D9DA]'
                  : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaved ? (
                <>
                  <span className="text-lg">✓</span>
                  <span>Saved / محفوظ</span>
                </>
              ) : (
                <>
                  <span className="text-lg">💾</span>
                  <span>Save Comments / حفظ الملاحظات</span>
                </>
              )}
            </button>
            {value.trim() && !isSaved && (
              <span className="text-xs text-orange-600">⚠️ Unsaved changes</span>
            )}
          </div>
        </div>

        {/* Voice recording section */}
        {!showVoiceRecorder ? (
          <button
            type="button"
            onClick={() => setShowVoiceRecorder(true)}
            className="w-full px-4 py-2 border-2 border-dashed border-[#B8D4D5]  bg-[#F8FAFA] hover:bg-[#E8F4F5] text-[#2D3436] font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">🎤</span>
            <span className="text-sm">Add Voice Memo / أضف مذكرة صوتية</span>
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowVoiceRecorder(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl z-10"
            >
              ×
            </button>
            <VoiceRecorder 
              customerId={customerId} 
              onRecordingComplete={handleVoiceRecording}
            />
          </div>
        )}

        {voiceMemoUrl && (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200  text-xs text-green-700">
            <span>✓</span>
            <span>Voice memo attached / تم إرفاق مذكرة صوتية</span>
          </div>
        )}
      </div>
    </div>
  )
}