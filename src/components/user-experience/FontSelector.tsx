'use client'

import { useState, useEffect } from 'react'

interface FontSelectorProps {
  onFontChange?: (font: string) => void
}

const englishFonts = [
  { name: 'Inter', value: 'Inter, sans-serif', label: 'Modern Clean' },
  { name: 'Roboto', value: 'Roboto, sans-serif', label: 'Google Standard' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif', label: 'Friendly' },
  { name: 'Lato', value: 'Lato, sans-serif', label: 'Professional' },
  { name: 'Poppins', value: 'Poppins, sans-serif', label: 'Rounded' }
]

const arabicFonts = [
  { name: 'Cairo', value: 'Cairo, sans-serif', label: 'كايرو - عصري' },
  { name: 'Tajawal', value: 'Tajawal, sans-serif', label: 'تجوال - واضح' },
  { name: 'Almarai', value: 'Almarai, sans-serif', label: 'المرعي - أنيق' },
  { name: 'Amiri', value: 'Amiri, serif', label: 'أميري - تقليدي' },
  { name: 'IBM Plex Sans Arabic', value: '"IBM Plex Sans Arabic", sans-serif', label: 'IBM - احترافي' }
]

export function FontSelector({ onFontChange }: FontSelectorProps) {
  const [selectedEnglishFont, setSelectedEnglishFont] = useState(englishFonts[0])
  const [selectedArabicFont, setSelectedArabicFont] = useState(arabicFonts[0])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Poppins:wght@400;500;600;700&family=Cairo:wght@400;600;700&family=Tajawal:wght@400;500;700&family=Almarai:wght@400;700&family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  const applyFonts = (englishFont: typeof englishFonts[0], arabicFont: typeof arabicFonts[0]) => {
    // Apply English font globally
    document.documentElement.style.setProperty('--font-english', englishFont.value)
    document.body.style.fontFamily = englishFont.value
    
    // Apply Arabic font to RTL elements
    const style = document.getElementById('dynamic-font-styles') || document.createElement('style')
    style.id = 'dynamic-font-styles'
    style.innerHTML = `
      [dir="rtl"], 
      .arabic-text,
      [lang="ar"] {
        font-family: ${arabicFont.value} !important;
      }
      body {
        font-family: ${englishFont.value};
      }
    `
    if (!document.getElementById('dynamic-font-styles')) {
      document.head.appendChild(style)
    }
  }

  const handleEnglishFontChange = (font: typeof englishFonts[0]) => {
    setSelectedEnglishFont(font)
    applyFonts(font, selectedArabicFont)
    onFontChange?.(font.value)
  }

  const handleArabicFontChange = (font: typeof arabicFonts[0]) => {
    setSelectedArabicFont(font)
    applyFonts(selectedEnglishFont, font)
    onFontChange?.(font.value)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white border-2 border-[#EDEDEA]  shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-12'
      }`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center justify-center hover:bg-[#F5F5F0] transition-colors "
          title="Font Settings"
        >
          <span className="text-lg">🔤</span>
        </button>
        
        {isExpanded && (
          <div className="p-4 border-t border-[#EDEDEA]">
            {/* English Fonts */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-[#636E72] mb-2">ENGLISH FONTS</h4>
              <div className="space-y-1">
                {englishFonts.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => handleEnglishFontChange(font)}
                    className={`w-full text-left px-3 py-2  text-sm transition-all ${
                      selectedEnglishFont.name === font.name
                        ? 'bg-[#5F9EA0] text-white'
                        : 'hover:bg-[#E8F4F5] text-[#2D3436]'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name} - {font.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Arabic Fonts */}
            <div>
              <h4 className="text-xs font-semibold text-[#636E72] mb-2">ARABIC FONTS / خطوط عربية</h4>
              <div className="space-y-1">
                {arabicFonts.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => handleArabicFontChange(font)}
                    className={`w-full text-right px-3 py-2  text-sm transition-all ${
                      selectedArabicFont.name === font.name
                        ? 'bg-[#5F9EA0] text-white'
                        : 'hover:bg-[#E8F4F5] text-[#2D3436]'
                    }`}
                    style={{ fontFamily: font.value }}
                    dir="rtl"
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Selection */}
            <div className="mt-4 pt-3 border-t border-[#EDEDEA] text-xs text-[#95A5A6]">
              <div>EN: {selectedEnglishFont.name}</div>
              <div>AR: {selectedArabicFont.name}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}