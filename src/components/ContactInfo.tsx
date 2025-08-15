'use client'

interface Customer {
  phone?: string
  city?: string
  contactPerson?: string | null
  name: string
  province?: string
  salesType?: string
}

interface ContactInfoProps {
  customer: Customer
}

export function ContactInfo({ customer }: ContactInfoProps) {
  // Format phone number: +971 (0) 56 555 5555
  const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return '—'
    
    // Remove any non-numeric characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Handle different formats
    let formatted = phone
    if (cleaned.startsWith('971')) {
      const number = cleaned.substring(3)
      if (number.length >= 9) {
        formatted = `+971 (0) ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
      }
    } else if (cleaned.startsWith('0')) {
      const number = cleaned.substring(1)
      if (number.length >= 8) {
        formatted = `+971 (0) ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
      }
    } else if (phone.startsWith('+')) {
      // Already formatted, just clean it up
      const number = cleaned.substring(3)
      if (number.length >= 9) {
        formatted = `+971 (0) ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
      }
    }
    
    return formatted
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-[#886baa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Contact Information
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Phone</p>
          <p className="font-medium text-gray-900">{formatPhoneNumber(customer.phone)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Contact Person</p>
          <p className="font-medium text-gray-900">{customer.contactPerson || customer.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Location</p>
          <p className="font-medium text-gray-900">{customer.city || '—'}, {customer.province || 'Dubai'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Sales Type</p>
          <p className="font-medium text-gray-900">{customer.salesType || 'RETAIL'}</p>
        </div>
      </div>
    </div>
  )
}