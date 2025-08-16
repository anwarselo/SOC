'use client'

interface LanguageToggleProps {
  language: 'en' | 'ar'
  onToggle: () => void
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2 border-2 border-[#B8D4D5]  bg-[#E8F4F5] hover:bg-[#D8E9EA] text-[#2D3436] font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
      aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      {language === 'en' ? (
        <>
          <span className="text-2xl">🇦🇪</span>
          <span className="text-base font-medium">العربية</span>
        </>
      ) : (
        <>
          <span className="text-2xl">🇬🇧</span>
          <span className="text-sm">English</span>
        </>
      )}
    </button>
  )
}