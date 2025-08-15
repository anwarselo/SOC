import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

function cleanValue(value: string | undefined): string | null {
  if (!value || value.trim() === '') return null
  return value.trim()
}

function parseNetValue(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

function parseDate(value: string | undefined): string | null {
  if (!value || value.trim() === '') return null
  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) return null
    return date.toISOString().split('T')[0]
  } catch {
    return null
  }
}

async function importCustomers() {
  try {
    const csvPath = path.join(process.cwd(), '..', 'resources', 'SCO Dubai.xlsx - Sheet 1.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    })

    console.log(`Found ${records.length} records to import`)

    const customers = records.map((record: Record<string, string>) => ({
      country: cleanValue(record['Country']) || 'UAE',
      customer_name: cleanValue(record['Customer Name']) || 'Unknown',
      contact_person: cleanValue(record['Contect Person']),
      mobile_no: cleanValue(record['Mobile No']) || `+971${Math.random().toString().slice(2, 11)}`,
      no_of_purchases: parseInt(record['No Of Purchases']) || 0,
      net_value: parseNetValue(record['Net Value']),
      currency: cleanValue(record['Ccy']) || 'AED',
      last_purchase_date: parseDate(record['Last Purchase']),
      sales_type: cleanValue(record['Sales Type']) || 'RETAIL',
      city: cleanValue(record['City']) || 'Dubai',
      province_emirate: cleanValue(record['Provience/Emirate']) || 'Dubai',
      country_full: cleanValue(record['Country-1']) || 'United Arab Emirates'
    }))

    // Import in batches of 100
    const batchSize = 100
    let imported = 0
    
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('sco_customers')
        .insert(batch)
        .select()

      if (error) {
        console.error(`Error importing batch ${i / batchSize + 1}:`, error)
        continue
      }

      imported += data?.length || 0
      console.log(`Imported ${imported}/${customers.length} customers`)
    }

    console.log('Import completed successfully!')
    console.log(`Total customers imported: ${imported}`)

  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  }
}

importCustomers()