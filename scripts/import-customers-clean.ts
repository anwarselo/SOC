import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

function parseNetValue(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null
  // Remove commas and non-numeric characters except dots and minus
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

function parseDate(value: string | undefined): string | null {
  if (!value || value.trim() === '') return null
  try {
    // Parse date in format: Feb/20/2018
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

    // Import ALL records exactly as they are (except parsing dates/numbers)
    const customers = records.map((record: Record<string, string>) => ({
      country: record['Country'] || null,
      customer_name: record['Customer Name'] || null,
      contact_person: record['Contect Person'] || null,  // Keep original typo from CSV
      mobile_no: record['Mobile No'] || null,
      no_of_purchases: parseInt(record['No Of Purchases']) || null,
      net_value: parseNetValue(record['Net Value']),
      currency: record['Ccy'] || null,
      last_purchase_date: parseDate(record['Last Purchase']),
      sales_type: record['Sales Type'] || null,
      city: record['City'] || null,
      province_emirate: record['Provience/Emirate'] || null,  // Keep original typo from CSV
      country_full: record['Country-1'] || null
    }))

    // Constraint already removed via mcp__sprodb__execute_sql

    // Import in batches of 100
    const batchSize = 100
    let imported = 0
    let failed = 0
    
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('sco_customers')
        .insert(batch)
        .select()

      if (error) {
        console.error(`Error importing batch ${i / batchSize + 1}:`, error.message)
        failed += batch.length
        continue
      }

      imported += data?.length || 0
      console.log(`Imported ${imported}/${customers.length} customers`)
    }

    console.log('Import completed!')
    console.log(`Total records in CSV: ${customers.length}`)
    console.log(`Successfully imported: ${imported}`)
    if (failed > 0) {
      console.log(`Failed to import: ${failed}`)
    }

  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  }
}

importCustomers()