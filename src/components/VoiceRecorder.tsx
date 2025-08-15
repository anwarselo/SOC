'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface VoiceRecorderProps {
  customerId: string
  onRecordingComplete: (url: string) => void
}

export function VoiceRecorder({ customerId, onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Upload to Supabase
        await uploadToSupabase(blob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Please allow microphone access to record voice memos')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
    }
  }

  const uploadToSupabase = async (blob: Blob) => {
    setIsUploading(true)
    try {
      const fileName = `${customerId}_${Date.now()}.webm`
      
      const { data, error } = await supabase.storage
        .from('voice-memos')
        .upload(fileName, blob, {
          contentType: 'audio/webm',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        alert('Failed to upload voice memo. It will be saved locally.')
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('voice-memos')
        .getPublicUrl(fileName)

      onRecordingComplete(publicUrl)
      
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
      setRecordingTime(0)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="border-2 border-[#B8D4D5] rounded-lg p-3 bg-[#F8FAFA]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#2D3436]">Recording</span>
        </div>
        {isRecording && (
          <span className="text-sm font-mono text-red-600 animate-pulse">
            {formatTime(recordingTime)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">⏺</span>
            <span>Start Recording / ابدأ التسجيل</span>
          </button>
        )}

        {isRecording && (
          <>
            <button
              onClick={pauseRecording}
              className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">{isPaused ? '▶️' : '⏸'}</span>
              <span>{isPaused ? 'Resume / استئناف' : 'Pause / إيقاف مؤقت'}</span>
            </button>
            <button
              onClick={stopRecording}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">⏹</span>
              <span>Stop / إيقاف</span>
            </button>
          </>
        )}

        {audioUrl && !isRecording && (
          <div className="flex-1 flex items-center gap-2">
            <audio controls src={audioUrl} className="flex-1" />
            <button
              onClick={deleteRecording}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              disabled={isUploading}
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="mt-2 text-xs text-[#636E72] text-center">
          Uploading to cloud... / جاري الرفع إلى السحابة...
        </div>
      )}

      <div className="mt-2 text-xs text-[#95A5A6]">
        💡 Tip: Record voice notes instead of typing. Max 2 minutes.
        <br />
        نصيحة: سجل ملاحظات صوتية بدلاً من الكتابة. الحد الأقصى دقيقتان.
      </div>
    </div>
  )
}