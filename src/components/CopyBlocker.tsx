'use client'

import { useEffect } from 'react'

export function CopyBlocker() {
  useEffect(() => {
    const blockEvent = (e: Event) => {
      e.preventDefault()
      return false
    }

    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Block copy, cut, paste events
    document.addEventListener('copy', blockEvent)
    document.addEventListener('cut', blockEvent)
    document.addEventListener('paste', blockEvent)
    document.addEventListener('contextmenu', blockContextMenu)

    // Block keyboard shortcuts
    const blockKeyboard = (e: KeyboardEvent) => {
      // Block Ctrl/Cmd + C, X, V, A
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        return false
      }
    }
    document.addEventListener('keydown', blockKeyboard)

    return () => {
      document.removeEventListener('copy', blockEvent)
      document.removeEventListener('cut', blockEvent)
      document.removeEventListener('paste', blockEvent)
      document.removeEventListener('contextmenu', blockContextMenu)
      document.removeEventListener('keydown', blockKeyboard)
    }
  }, [])

  return null
}