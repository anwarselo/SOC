import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Customer {
  id: string
  country: string
  customer_name: string
  contact_person: string | null
  mobile_no: string
  no_of_purchases: number
  net_value: number | null
  currency: string
  last_purchase_date: string | null
  sales_type: string
  city: string
  province_emirate: string
  country_full: string
  created_at: string
  updated_at: string
}

export interface CallOutcome {
  id: string
  customer_id: string
  user_id: string | null
  call_date: string
  status: 'no_answer' | 'busy' | 'interested' | 'not_interested' | 'callback' | 'purchased' | 'wrong_number'
  notes: string | null
  callback_date: string | null
  duration_seconds: number | null
  created_at: string
}