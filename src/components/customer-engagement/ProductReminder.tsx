'use client'

import { useState, useEffect } from 'react'

interface ProductReminderProps {
  language: 'en' | 'ar'
}

interface ProductHighlight {
  en: string
  ar: string
  category: 'new' | 'luxury' | 'smart' | 'free' | 'feedback' | 'collection' | 'service' | 'exclusive'
}

const productHighlights: ProductHighlight[] = [
  // NEW Products
  { en: 'NEW: The Metropolitan Museum Art Collection - Custom curtains & wallpapers with iconic artwork', ar: 'جديد: مجموعة متحف المتروبوليتان للفنون - ستائر وورق جدران مخصص بأعمال فنية أيقونية', category: 'new' },
  { en: 'NEW: Blackout Smart Curtains with Voice Control - Alexa & Google Compatible', ar: 'جديد: ستائر ذكية معتمة مع التحكم الصوتي - متوافقة مع أليكسا وجوجل', category: 'new' },
  { en: 'NEW: Motorized Blinds with Solar Panel Charging - Eco-friendly automation', ar: 'جديد: بلايند محركة بالطاقة الشمسية - أتمتة صديقة للبيئة', category: 'new' },
  { en: 'NEW: Anti-Bacterial Fabric Collection - Hospital-grade protection for homes', ar: 'جديد: مجموعة أقمشة مضادة للبكتيريا - حماية طبية للمنازل', category: 'new' },
  { en: 'NEW: UV Protection Window Films - 99% harmful ray blocking', ar: 'جديد: أفلام النوافذ الواقية من الأشعة فوق البنفسجية - حماية 99٪', category: 'new' },
  { en: 'NEW: Sound-Absorbing Curtains - Reduce noise by up to 80%', ar: 'جديد: ستائر ماصة للصوت - تقليل الضوضاء حتى 80٪', category: 'new' },
  { en: 'NEW: Climate Control Fabrics - Temperature regulating technology', ar: 'جديد: أقمشة التحكم في المناخ - تقنية تنظيم درجة الحرارة', category: 'new' },
  { en: 'NEW: Holographic Wallpapers - 3D visual effects that change with light', ar: 'جديد: ورق جدران هولوجرامي - تأثيرات بصرية ثلاثية الأبعاد', category: 'new' },

  // Luxury Brands
  { en: 'Luxury Brands: Armani Casa, Versace Home, Missoni Home', ar: 'علامات فاخرة: أرماني كازا، فيرساتشي هوم، ميسوني هوم', category: 'luxury' },
  { en: 'Luxury: Hermès Wallpapers - Exclusive patterns from the fashion house', ar: 'فاخر: ورق جدران هيرميس - أنماط حصرية من دار الأزياء', category: 'luxury' },
  { en: 'Luxury: Fendi Casa Collection - Italian craftsmanship meets home décor', ar: 'فاخر: مجموعة فيندي كازا - الحرفية الإيطالية تلتقي بديكور المنزل', category: 'luxury' },
  { en: 'Luxury: Loro Piana Interiors - Cashmere and finest fabrics for homes', ar: 'فاخر: لورو بيانا للديكور الداخلي - الكشمير والأقمشة الفاخرة', category: 'luxury' },
  { en: 'Luxury: Ralph Lauren Home - American elegance and timeless style', ar: 'فاخر: رالف لورين هوم - الأناقة الأمريكية والأسلوب الخالد', category: 'luxury' },
  { en: 'Luxury: Christian Dior Maison - French haute couture for interiors', ar: 'فاخر: كريستيان ديور ميزون - الأزياء الراقية الفرنسية للديكور', category: 'luxury' },
  { en: 'Luxury: Bulgari Home Collection - Precious metals and gemstone accents', ar: 'فاخر: مجموعة بولغاري هوم - المعادن الثمينة والأحجار الكريمة', category: 'luxury' },

  // Smart Home
  { en: 'Smart Home: Somfy automation for curtains & blinds', ar: 'المنزل الذكي: أتمتة سومفي للستائر والبلايند', category: 'smart' },
  { en: 'Smart: Lutron Automated Shades - Professional home automation system', ar: 'ذكي: ظلال لوترون الآلية - نظام أتمتة منزلية احترافي', category: 'smart' },
  { en: 'Smart: Hunter Douglas PowerView - Remote control from anywhere in the world', ar: 'ذكي: هانتر دوغلاس باور فيو - تحكم عن بُعد من أي مكان في العالم', category: 'smart' },
  { en: 'Smart: IKEA FYRTUR Integration - Affordable smart blinds with app control', ar: 'ذكي: تكامل إيكيا فيرتور - بلايند ذكية بأسعار معقولة مع تطبيق', category: 'smart' },
  { en: 'Smart: Zigbee Compatible Systems - Works with Samsung SmartThings', ar: 'ذكي: أنظمة متوافقة مع زيجبي - تعمل مع سامسونج سمارت ثينغز', category: 'smart' },
  { en: 'Smart: Voice Control Integration - Works with Siri, Alexa, Google Assistant', ar: 'ذكي: تكامل التحكم الصوتي - يعمل مع سيري وأليكسا ومساعد جوجل', category: 'smart' },

  // FREE Services
  { en: 'FREE: Delivery, installation, consultation & measurement', ar: 'مجاناً: التوصيل والتركيب والاستشارة والقياس', category: 'free' },
  { en: 'FREE: 3D Virtual Room Preview - See before you buy', ar: 'مجاناً: معاينة افتراضية ثلاثية الأبعاد للغرفة - شاهد قبل الشراء', category: 'free' },
  { en: 'FREE: Color Matching Service - Perfect coordination with existing décor', ar: 'مجاناً: خدمة مطابقة الألوان - تنسيق مثالي مع الديكور الحالي', category: 'free' },
  { en: 'FREE: Fabric Samples - Take home swatches for 7 days', ar: 'مجاناً: عينات القماش - خذ العينات للمنزل لمدة 7 أيام', category: 'free' },
  { en: 'FREE: Maintenance Kit - Cleaning supplies and care instructions', ar: 'مجاناً: مجموعة الصيانة - مواد التنظيف وتعليمات العناية', category: 'free' },
  { en: 'FREE: Seasonal Storage Service - We store your curtains during renovation', ar: 'مجاناً: خدمة التخزين الموسمية - نحفظ ستائرك أثناء التجديد', category: 'free' },
  { en: 'FREE: Interior Design Consultation - Professional advice from certified designers', ar: 'مجاناً: استشارة التصميم الداخلي - نصائح من مصممين معتمدين', category: 'free' },

  // Customer Feedback
  { en: 'Customer Feedback: "Transforms homes into art galleries"', ar: 'آراء العملاء: "يحول المنازل إلى معارض فنية"', category: 'feedback' },
  { en: 'Customer Review: "Best investment we made for our home comfort"', ar: 'آراء العملاء: "أفضل استثمار للراحة في منزلنا"', category: 'feedback' },
  { en: 'Client Testimonial: "Professional service from consultation to installation"', ar: 'شهادة عميل: "خدمة احترافية من الاستشارة للتركيب"', category: 'feedback' },
  { en: 'Customer Quote: "Energy bills reduced by 40% with thermal curtains"', ar: 'آراء العملاء: "فواتير الطاقة انخفضت 40٪ مع الستائر الحرارية"', category: 'feedback' },
  { en: 'Review: "Children sleep better with blackout curtains - life changing!"', ar: 'مراجعة: "الأطفال ينامون أفضل مع الستائر المعتمة - غيرت حياتنا!"', category: 'feedback' },
  { en: 'Testimonial: "Smart home integration was seamless and impressive"', ar: 'شهادة: "تكامل المنزل الذكي كان سلساً ومثيراً للإعجاب"', category: 'feedback' },

  // Collections
  { en: 'Collection: Middle Eastern Heritage Patterns - Traditional meets modern', ar: 'مجموعة: أنماط التراث الشرق أوسطي - التقليدي يلتقي بالحديث', category: 'collection' },
  { en: 'Collection: Botanical Paradise - Nature-inspired designs for wellness', ar: 'مجموعة: الجنة النباتية - تصاميم مستوحاة من الطبيعة للصحة', category: 'collection' },
  { en: 'Collection: Geometric Minimalism - Clean lines for contemporary spaces', ar: 'مجموعة: البساطة الهندسية - خطوط نظيفة للمساحات المعاصرة', category: 'collection' },
  { en: 'Collection: Vintage Luxury Revival - Classic European elegance', ar: 'مجموعة: إحياء الرفاهية العتيقة - الأناقة الأوروبية الكلاسيكية', category: 'collection' },
  { en: 'Collection: Coastal Breeze - Light fabrics inspired by Mediterranean', ar: 'مجموعة: نسيم الساحل - أقمشة خفيفة مستوحاة من البحر المتوسط', category: 'collection' },

  // Exclusive Services
  { en: 'Exclusive: Private Showroom Appointments - VIP shopping experience', ar: 'حصري: مواعيد صالة العرض الخاصة - تجربة تسوق VIP', category: 'exclusive' },
  { en: 'Exclusive: Same-Day Installation - Emergency curtain replacement service', ar: 'حصري: تركيب في نفس اليوم - خدمة استبدال الستائر الطارئة', category: 'exclusive' },
  { en: 'Exclusive: Custom Color Matching - Any color you can imagine', ar: 'حصري: مطابقة الألوان المخصصة - أي لون يمكنك تخيله', category: 'exclusive' },
  { en: 'Exclusive: Hotel & Restaurant Projects - Commercial design services', ar: 'حصري: مشاريع الفنادق والمطاعم - خدمات التصميم التجاري', category: 'exclusive' },
  { en: 'Exclusive: Yacht & Private Jet Interiors - Luxury transport solutions', ar: 'حصري: ديكور اليخوت والطائرات الخاصة - حلول النقل الفاخرة', category: 'exclusive' },

  // Service Highlights
  { en: 'Service: 10-Year Warranty on All Motorized Systems', ar: 'خدمة: ضمان 10 سنوات على جميع الأنظمة المحركة', category: 'service' },
  { en: 'Service: 24/7 Emergency Repair Hotline - We\'re always available', ar: 'خدمة: خط ساخن للإصلاح الطارئ 24/7 - نحن متاحون دائماً', category: 'service' },
  { en: 'Service: Seasonal Cleaning & Maintenance Programs', ar: 'خدمة: برامج التنظيف والصيانة الموسمية', category: 'service' },
  { en: 'Service: Trade-In Program - Upgrade your old curtains for credit', ar: 'خدمة: برنامج المقايضة - ترقية ستائرك القديمة مقابل رصيد', category: 'service' },
  { en: 'Service: Corporate & Bulk Discounts - Special rates for large projects', ar: 'خدمة: خصومات الشركات والكميات - أسعار خاصة للمشاريع الكبيرة', category: 'service' }
]

const categoryColors = {
  new: '#e17553',      // burnt sienna
  luxury: '#886baa',   // pomp and power  
  smart: '#a97e9d',    // mountbatten pink
  free: '#543b73',     // eminence
  feedback: '#c7b1d7', // lilac
  collection: '#8a4a62', // quinacridone magenta
  service: '#e3d8eb',  // pale purple
  exclusive: '#886baa'  // pomp and power
}

const categoryIcons = {
  new: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  luxury: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  smart: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  free: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
  feedback: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  collection: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  service: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  exclusive: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
}

export function ProductReminder({ language }: ProductReminderProps) {
  const [currentHighlights, setCurrentHighlights] = useState<ProductHighlight[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  // Function to get 5 random highlights ensuring variety of categories
  const getRandomHighlights = () => {
    const shuffled = [...productHighlights].sort(() => Math.random() - 0.5)
    const selected: ProductHighlight[] = []
    const usedCategories = new Set<string>()
    
    // First pass: Try to get different categories
    for (const highlight of shuffled) {
      if (!usedCategories.has(highlight.category) && selected.length < 5) {
        selected.push(highlight)
        usedCategories.add(highlight.category)
      }
    }
    
    // Second pass: Fill remaining slots if needed
    for (const highlight of shuffled) {
      if (selected.length < 5 && !selected.includes(highlight)) {
        selected.push(highlight)
      }
    }
    
    return selected.slice(0, 5)
  }

  // Initialize and refresh highlights
  useEffect(() => {
    setCurrentHighlights(getRandomHighlights())
  }, [refreshKey])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const refreshHighlights = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="relative bg-gradient-to-r from-[#e3d8eb]/80 via-[#c7b1d7]/60 to-[#a97e9d]/40 backdrop-blur-sm border-2 border-[#c7b1d7] rounded-2xl p-6 mb-6 shadow-lg">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#886baa]/20 to-[#543b73]/10 rounded-full -translate-y-10 translate-x-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-[#e17553]/20 to-[#8a4a62]/10 rounded-full translate-y-8 -translate-x-8"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-xl shadow-md border border-[#e3d8eb]">
              <svg className="w-6 h-6 text-[#886baa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h4 className={`font-bold text-[#543b73] ${language === 'ar' ? 'text-xl text-right' : 'text-lg text-left'}`}>
              {language === 'en' ? 'Key Products to Mention' : 'المنتجات الرئيسية للذكر'}
            </h4>
          </div>
          
          <button
            onClick={refreshHighlights}
            className="p-2 bg-white/70 hover:bg-white rounded-lg border border-[#e3d8eb] transition-all duration-200 group"
            title={language === 'en' ? 'Refresh highlights' : 'تحديث المنتجات'}
          >
            <svg className="w-4 h-4 text-[#886baa] group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-[#e3d8eb]/50">
          <ul className={`text-[#543b73] space-y-3 ${language === 'ar' ? 'text-base' : 'text-sm'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {currentHighlights.map((highlight, index) => (
              <li key={`${highlight.category}-${index}-${refreshKey}`} className="flex items-start gap-2 opacity-0 animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                <span 
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0" 
                  style={{ backgroundColor: categoryColors[highlight.category] }}
                ></span>
                <span dangerouslySetInnerHTML={{ 
                  __html: language === 'en' ? highlight.en : highlight.ar 
                }} />
              </li>
            ))}
          </ul>
          
          <div className="mt-4 pt-3 border-t border-[#e3d8eb]/50">
            <p className={`text-xs text-[#8a4a62] opacity-70 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'en' 
                ? 'Highlights refresh automatically every 30 seconds • Click refresh for new selection'
                : 'تتحديث المنتجات المميزة تلقائياً كل 30 ثانية • انقر للتحديث للحصول على اختيار جديد'
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* CSS for fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}