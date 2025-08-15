'use client'

interface FilterTabsProps {
  activeView: 'pending' | 'callbacks'
  onChange: (view: 'pending' | 'callbacks') => void
}

export function FilterTabs({ activeView, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => activeView !== 'pending' && onChange('pending')}
        className={`px-5 py-2.5 rounded-lg border-2 transition-all duration-200 font-medium ${
          activeView === 'pending'
            ? 'bg-gradient-to-r from-[#E8F4F5] to-[#D8E9EA] border-[#5F9EA0] text-[#2D3436] shadow-sm'
            : 'bg-[#FAFAF8] border-[#EDEDEA] text-[#636E72] hover:bg-[#F5F5F0] hover:border-[#B8D4D5]'
        }`}
      >
        New Customers
      </button>
      <button
        onClick={() => activeView !== 'callbacks' && onChange('callbacks')}
        className={`px-5 py-2.5 rounded-lg border-2 transition-all duration-200 font-medium ${
          activeView === 'callbacks'
            ? 'bg-gradient-to-r from-[#E8F4F5] to-[#D8E9EA] border-[#5F9EA0] text-[#2D3436] shadow-sm'
            : 'bg-[#FAFAF8] border-[#EDEDEA] text-[#636E72] hover:bg-[#F5F5F0] hover:border-[#B8D4D5]'
        }`}
      >
        Today&apos;s Callbacks
      </button>
    </div>
  )
}