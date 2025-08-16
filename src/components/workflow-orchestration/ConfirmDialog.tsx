'use client'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm / تأكيد',
  cancelText = 'Cancel / إلغاء',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white  shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-[#2D3436] mb-3">{title}</h3>
        <p className="text-[#636E72] mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border-2 border-[#EDEDEA]  bg-[#FAFAF8] hover:bg-[#F5F5F0] text-[#636E72] font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 border-2 border-[#5F9EA0]  bg-gradient-to-r from-[#E8F4F5] to-[#D8E9EA] hover:from-[#D8E9EA] hover:to-[#C8D9DA] text-[#2D3436] font-medium transition-all"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}