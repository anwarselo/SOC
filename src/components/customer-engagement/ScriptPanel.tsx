'use client'

import { useState } from 'react'

type ProductCategory = 'general' | 'met-collection' | 'armani-casa' | 'versace-home' | 'wallpapers' | 'curtains' | 'upholstery'

interface ScriptPanelProps {
  status: 'pending' | 'callback' | 'completed'
  callbackDate?: string
  language?: 'en' | 'ar'
  customerName?: string
  lastPurchaseDate?: string | null
  salespersonName?: string
}

export function ScriptPanel({ status, callbackDate, language = 'en', customerName, lastPurchaseDate, salespersonName }: ScriptPanelProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductCategory>('general')
  
  // Helper function to get first name from full name
  const getFirstName = (fullName?: string) => {
    if (!fullName) return '[Name]'
    const nameParts = fullName.trim().split(' ')
    return nameParts[0] || '[Name]'
  }

  // Helper function to get last purchase year
  const getLastPurchaseYear = (dateString?: string | null) => {
    if (!dateString) return '[year of relationship]'
    try {
      const year = new Date(dateString).getFullYear()
      return year.toString()
    } catch {
      return '[year of relationship]'
    }
  }

  const customerFirstName = getFirstName(customerName)
  const salespersonFirstName = getFirstName(salespersonName)
  const purchaseYear = getLastPurchaseYear(lastPurchaseDate)

  // Product categories data
  const productCategories = [
    { id: 'general' as ProductCategory, name: 'General', nameAr: 'عام', icon: '🏠' },
    { id: 'met-collection' as ProductCategory, name: 'Met Collection', nameAr: 'مجموعة المتروبوليتان', icon: '🎨' },
    { id: 'armani-casa' as ProductCategory, name: 'Armani Casa', nameAr: 'أرماني كازا', icon: '👔' },
    { id: 'versace-home' as ProductCategory, name: 'Versace Home', nameAr: 'فيرساتشي هوم', icon: '👑' },
    { id: 'wallpapers' as ProductCategory, name: 'Wallpapers', nameAr: 'ورق الجدران', icon: '🎭' },
    { id: 'curtains' as ProductCategory, name: 'Curtains', nameAr: 'الستائر', icon: '🪟' },
    { id: 'upholstery' as ProductCategory, name: 'Upholstery', nameAr: 'التنجيد', icon: '🛋️' }
  ]

  // Dynamic script content based on selected product
  const getScriptContent = (product: ProductCategory) => {
    const scripts = {
      general: {
        en: `"Good [morning/afternoon] ${customerFirstName}, this is ${salespersonFirstName} from Sedar Global. I'm reaching out with exciting news about our exclusive collections featuring custom curtains, wallpapers, and upholstery. We have new arrivals from Armani Casa and Versace Home collections with complimentary delivery and professional installation. You've been a valued customer with us since ${purchaseYear}. May I share these exclusive luxury collections with you?"`,
        ar: `"صباح/مساء الخير ${customerFirstName}، معك ${salespersonFirstName} من سيدار جلوبال. أتواصل معك بأخبار مثيرة عن مجموعاتنا الحصرية تتضمن ستائر مخصصة، ورق جدران، وأقمشة تنجيد. لدينا وصولات جديدة من مجموعات أرماني كازا وفيرساتشي هوم مع توصيل مجاني وتركيب احترافي. أنت عميل مميز معنا منذ ${purchaseYear}. هل يمكنني مشاركة هذه المجموعات الفاخرة الحصرية معك؟"`
      },
      'met-collection': {
        en: `"Good [morning/afternoon] ${customerFirstName}, this is ${salespersonFirstName} from Sedar Global. I have incredible news - we've just received the exclusive Metropolitan Museum Art Collection featuring iconic artwork from The Met transformed into luxury home furnishings. These custom curtains, wallpapers, and upholstery pieces bring museum-quality art directly into your living space. Our interior design consultant can show you how these masterpieces would elevate your home's aesthetic. Would you be interested in viewing this once-in-a-lifetime collection?"`,
        ar: `"صباح/مساء الخير ${customerFirstName}، معك ${salespersonFirstName} من سيدار جلوبال. لدي أخبار رائعة - استلمنا للتو مجموعة متحف المتروبوليتان للفنون الحصرية تتضمن أعمالاً فنية أيقونية من المتحف محولة إلى مفروشات منزلية فاخرة. هذه الستائر المخصصة، ورق الجدران، وقطع التنجيد تجلب فناً بجودة المتاحف مباشرة إلى مساحة معيشتك. مستشار التصميم الداخلي لدينا يمكنه أن يريك كيف ستعزز هذه التحف الجمالية لمنزلك. هل ستكون مهتماً بمعاينة هذه المجموعة الفريدة من نوعها؟"`
      },
      'armani-casa': {
        en: `"Good [morning/afternoon] ${customerFirstName}, this is ${salespersonFirstName} from Sedar Global. I'm calling with exclusive access to the new Armani Casa collection - featuring Giorgio Armani's signature sophistication translated into home furnishings. These pieces combine Italian craftsmanship with modern elegance, perfect for creating that understated luxury atmosphere. We're offering complimentary design consultation and professional installation. As a valued customer since ${purchaseYear}, would you like to preview these exclusive Armani pieces?"`,
        ar: `"صباح/مساء الخير ${customerFirstName}، معك ${salespersonFirstName} من سيدار جلوبال. أتصل بك للحصول على وصول حصري لمجموعة أرماني كازا الجديدة - تتميز بأناقة جورجيو أرماني المميزة مترجمة في مفروشات المنزل. هذه القطع تجمع بين الحرفية الإيطالية والأناقة الحديثة، مثالية لخلق جو من الفخامة المتواضعة. نقدم استشارة تصميم مجانية وتركيب احترافي. كعميل مميز منذ ${purchaseYear}، هل تود معاينة هذه القطع الحصرية من أرماني؟"`
      },
      'versace-home': {
        en: `"Good [morning/afternoon] ${customerFirstName}, this is ${salespersonFirstName} from Sedar Global. I have exciting news about our Versace Home collection - bringing Donatella Versace's bold, opulent design philosophy into luxury home décor. These stunning wallpapers, curtains, and upholstery feature the iconic Medusa motifs and baroque patterns that make a dramatic statement. Our design team can help you incorporate these statement pieces. Given your excellent taste since ${purchaseYear}, I believe you'd appreciate these magnificent Versace creations?"`,
        ar: `"صباح/مساء الخير ${customerFirstName}، معك ${salespersonFirstName} من سيدار جلوبال. لدي أخبار مثيرة عن مجموعة فيرساتشي هوم - تجلب فلسفة التصميم الجريئة والفخمة لدوناتيلا فيرساتشي إلى ديكور المنزل الفاخر. ورق الجدران، الستائر، والتنجيد المذهلة تتميز بزخارف الميدوسا الأيقونية والأنماط الباروكية التي تصنع بياناً دراماتيكياً. فريق التصميم لدينا يمكنه مساعدتك في دمج هذه القطع المميزة. نظراً لذوقك الممتاز منذ ${purchaseYear}، أعتقد أنك ستقدر هذه الإبداعات الرائعة من فيرساتشي؟"`
      },
      wallpapers: {
        en: `"Good [morning/afternoon] ${customerFirstName}, this is ${salespersonFirstName} from Sedar Global. I'm excited to tell you about our premium wallpaper collection featuring exclusive designs from international artists and luxury brands. From subtle textures to bold statement walls, we have options that transform any room into a work of art. Our installation team ensures perfect application with no bubbles or imperfections. Since you've trusted us since ${purchaseYear}, would you like to see our latest wallpaper innovations?"`,
        ar: `"صباح/مساء الخير ${customerFirstName}، معك ${salespersonFirstName} من سيدار جلوبال. أنا متحمس لأخبرك عن مجموعة ورق الجدران المتميزة لدينا تتضمن تصاميم حصرية من فنانين عالميين وعلامات تجارية فاخرة. من الملمس الناعم إلى الجدران المميزة الجريئة، لدينا خيارات تحول أي غرفة إلى عمل فني. فريق التركيب لدينا يضمن تطبيقاً مثالياً بدون فقاعات أو عيوب. منذ أن وثقت بنا منذ ${purchaseYear}، هل تود رؤية أحدث ابتكارات ورق الجدران لدينا؟"`
      },
      curtains: {
        en: `"Good [morning/afternoon] ${customerFirstName}, this is ${salespersonFirstName} from Sedar Global. I'm calling about our exquisite curtain collection featuring the finest fabrics from European mills. Whether you prefer classic elegance, modern minimalism, or bold patterns, our custom curtains are tailored to your exact specifications. We include professional measurement, installation, and a 5-year warranty. As a valued client since ${purchaseYear}, would you be interested in upgrading your window treatments with our luxury curtain collection?"`,
        ar: `"صباح/مساء الخير ${customerFirstName}، معك ${salespersonFirstName} من سيدار جلوبال. أتصل بخصوص مجموعة الستائر الرائعة لدينا تتضمن أجود الأقمشة من مصانع أوروبية. سواء كنت تفضل الأناقة الكلاسيكية، البساطة الحديثة، أو الأنماط الجريئة، ستائرنا المخصصة مصممة حسب مواصفاتك الدقيقة. نشمل القياس الاحترافي، التركيب، وضمان 5 سنوات. كعميل مميز منذ ${purchaseYear}، هل ستكون مهتماً بترقية معالجات النوافذ لديك بمجموعة الستائر الفاخرة لدينا؟"`
      },
      upholstery: {
        en: `"Good [morning/afternoon] ${customerFirstName}, this is ${salespersonFirstName} from Sedar Global. I wanted to discuss our premium upholstery collection featuring Italian leather, Belgian velvet, and designer fabrics from renowned textile houses. Whether refreshing existing furniture or selecting fabrics for new pieces, our craftsmen ensure exceptional quality and durability. We offer in-home consultation and color matching services. Given your refined taste since ${purchaseYear}, I believe you'd appreciate our artisanal upholstery options?"`,
        ar: `"صباح/مساء الخير ${customerFirstName}، معك ${salespersonFirstName} من سيدار جلوبال. أردت مناقشة مجموعة التنجيد المتميزة لدينا تتضمن جلداً إيطالياً، مخملاً بلجيكياً، وأقمشة مصممة من دور النسيج المشهورة. سواء لتجديد الأثاث الموجود أو اختيار أقمشة لقطع جديدة، حرفيونا يضمنون جودة ومتانة استثنائية. نقدم استشارة في المنزل وخدمات مطابقة الألوان. نظراً لذوقك المرهف منذ ${purchaseYear}، أعتقد أنك ستقدر خيارات التنجيد الحرفية لدينا؟"`
      }
    }
    return scripts[product] || scripts.general
  }
  if (status === 'completed') {
    return (
      <div className="bg-gradient-to-br from-[#E8F5E9] to-[#D4EDDA] border-2 border-[#81C784]  p-5 shadow-sm">
        <h3 className={`font-bold text-[#2D3436] mb-2 ${language === 'ar' ? 'text-xl text-right' : 'text-lg text-left'}`}>
          {language === 'en' ? 'Call Completed' : 'تمت المكالمة'}
        </h3>
        <p className={`text-[#2D3436] leading-relaxed font-normal ${language === 'ar' ? 'text-xl' : 'text-base'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language === 'en' 
            ? 'Customer contacted. Follow-up may be needed for installation or additional products.'
            : 'تم الاتصال بالعميل. قد تكون هناك حاجة للمتابعة للتركيب أو منتجات إضافية.'}
        </p>
      </div>
    )
  }

  if (status === 'callback') {
    return (
      <div className="bg-gradient-to-br from-[#FFF3E0] to-[#FFE8CC] border-2 border-[#FFB74D]  p-5 shadow-sm">
        <h3 className={`font-bold text-[#2D3436] mb-2 ${language === 'ar' ? 'text-xl text-right' : 'text-lg text-left'}`}>
          {language === 'en' ? 'Follow-Up Script' : 'نص المتابعة'}
        </h3>
        {callbackDate && (
          <p className={`text-xs text-[#636E72] mb-2 ${language === 'ar' ? 'text-sm' : ''}`}>
            {language === 'en' ? `Scheduled for: ${callbackDate}` : `موعد الاتصال: ${callbackDate}`}
          </p>
        )}
        <p className={`text-[#2D3436] leading-relaxed font-normal ${language === 'ar' ? 'text-xl' : 'text-base'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language === 'en'
            ? `"Hello ${customerFirstName}, this is ${salespersonFirstName} from Sedar Global following up on our previous conversation. You showed interest in our exclusive collections. I have exciting news - we've just received new arrivals from The Metropolitan Museum Art Collection featuring stunning designs. Our interior design consultant is available to show you how these luxury pieces would transform your space. We continue to offer complimentary consultation and professional installation. Would you like me to schedule a convenient time for you to view these exclusive collections?"`
            : `"مرحباً ${customerFirstName}، معك ${salespersonFirstName} من سيدار جلوبال أتابع معك بخصوص محادثتنا السابقة. أظهرت اهتماماً بمجموعاتنا الحصرية. لدي أخبار مثيرة - استلمنا للتو وصولات جديدة من مجموعة متحف المتروبوليتان للفنون تتضمن تصاميم مذهلة. مستشار التصميم الداخلي لدينا متاح ليريك كيف ستحول هذه القطع الفاخرة مساحتك. نواصل تقديم استشارة مجانية وتركيب احترافي. هل تود أن أحدد لك وقتاً مناسباً لمعاينة هذه المجموعات الحصرية؟"`}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#e3d8eb]/60 to-[#c7b1d7]/40 border-2 border-[#c7b1d7]  p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-[#543b73] ${language === 'ar' ? 'text-xl text-right' : 'text-lg text-left'}`}>
          {language === 'en' ? 'Initial Outreach Script' : 'نص الاتصال الأولي'}
        </h3>
      </div>

      {/* Product Category Selector */}
      <div className="mb-4">
        <p className={`text-sm font-medium text-[#8a4a62] mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          {language === 'en' ? 'Focus on specific product:' : 'التركيز على منتج محدد:'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {productCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedProduct(category.id)}
              className={`p-2  border-2 text-xs font-medium transition-all duration-200 ${
                selectedProduct === category.id
                  ? 'border-[#886baa] bg-[#886baa] text-white shadow-md'
                  : 'border-[#c7b1d7] bg-white/80 text-[#543b73] hover:border-[#886baa] hover:bg-[#886baa]/10'
              }`}
            >
              <div className="text-base mb-1">{category.icon}</div>
              <div>{language === 'en' ? category.name : category.nameAr}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Script Content */}
      <div className="bg-white/40  p-4 border border-[#c7b1d7]/30">
        <p className={`text-[#543b73] leading-relaxed font-normal ${language === 'ar' ? 'text-xl' : 'text-base'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {getScriptContent(selectedProduct)[language]}
        </p>
      </div>
    </div>
  )
}