'use client'

import { usePathname } from 'next/navigation'
import { ProfessionalHeader } from './ProfessionalHeader'

export function AppTopbar() {
  const pathname = usePathname()
  
  const getPageInfo = () => {
    if (pathname === '/app/admin') {
      return {
        title: 'Admin Dashboard',
        subtitle: 'System administration and management / إدارة النظام والإشراف'
      }
    }
    // Default for calls and other pages
    return {
      title: 'Sedar Outreach',
      subtitle: 'Customer Relationship Management / إدارة علاقات العملاء'
    }
  }

  const { title, subtitle } = getPageInfo()

  return (
    <ProfessionalHeader 
      title={title}
      subtitle={subtitle}
    />
  )
}