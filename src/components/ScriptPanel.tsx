'use client'

interface ScriptPanelProps {
  status: 'pending' | 'callback' | 'completed'
  callbackDate?: string
  language?: 'en' | 'ar'
}

export function ScriptPanel({ status, callbackDate, language = 'en' }: ScriptPanelProps) {
  if (status === 'completed') {
    return (
      <div className="bg-gradient-to-br from-[#E8F5E9] to-[#D4EDDA] border-2 border-[#81C784] rounded-xl p-5 shadow-sm">
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
      <div className="bg-gradient-to-br from-[#FFF3E0] to-[#FFE8CC] border-2 border-[#FFB74D] rounded-xl p-5 shadow-sm">
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
            ? '"Hi [Customer Name], this is [Your Name] from Sedar Global following up. You were interested in [The Met Collection/Armani Casa/Versace Home]. Great news - we just received new designs from The Metropolitan Museum collection featuring [specific artwork/pattern]. Our design consultant can show you how these exclusive pieces would look in your space. We still offer free consultation and installation. Shall I arrange a viewing?"'
            : '"مرحباً [اسم العميل]، معك [اسمك] من سيدار جلوبال أتابع معك. كنت مهتماً بـ [مجموعة المتحف/أرماني كازا/فيرساتشي هوم]. أخبار رائعة - استلمنا للتو تصاميم جديدة من مجموعة متحف المتروبوليتان تتضمن [عمل فني/نمط محدد]. يمكن لمستشار التصميم لدينا أن يريك كيف ستبدو هذه القطع الحصرية في مساحتك. ما زلنا نقدم استشارة وتركيب مجاني. هل أرتب لك موعد للمعاينة؟"'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#e3d8eb]/60 to-[#c7b1d7]/40 border-2 border-[#c7b1d7] rounded-xl p-5 shadow-sm">
      <h3 className={`font-bold text-[#543b73] mb-2 ${language === 'ar' ? 'text-xl text-right' : 'text-lg text-left'}`}>
        {language === 'en' ? 'Initial Outreach Script' : 'نص الاتصال الأولي'}
      </h3>
      <p className={`text-[#543b73] leading-relaxed font-normal ${language === 'ar' ? 'text-xl' : 'text-base'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {language === 'en'
          ? '"Good [morning/afternoon], this is [Your Name] from Sedar Global. I\'m reaching out with exciting news about our exclusive Metropolitan Museum Art Collection - featuring custom curtains, wallpapers, and upholstery with iconic artwork from The Met. We\'ve received amazing feedback from customers who love how it transforms their homes. Plus, Armani Casa and Versace Home collections with FREE delivery and installation. You\'ve been valued customer since [date]. May I share these exclusive collections with you?"'
          : '"صباح/مساء الخير، معك [اسمك] من سيدار جلوبال. أتواصل معك بأخبار مثيرة عن مجموعة متحف المتروبوليتان للفنون الحصرية - تتضمن ستائر مخصصة، ورق جدران، وأقمشة تنجيد بأعمال فنية أيقونية من المتحف. تلقينا آراء رائعة من العملاء الذين يحبون كيف تحول منازلهم. بالإضافة إلى مجموعات أرماني كازا وفيرساتشي هوم مع توصيل وتركيب مجاني. أنت عميل مميز معنا منذ [التاريخ]. هل يمكنني مشاركة هذه المجموعات الحصرية معك؟"'}
      </p>
    </div>
  )
}