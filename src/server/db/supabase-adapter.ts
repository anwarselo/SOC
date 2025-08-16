import { createClient } from '@supabase/supabase-js'
import { createAdapter } from 'better-auth/adapters'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SupabaseAdapterConfig {
  debugLogs?: boolean | object
}

export const supabaseAdapter = (config: SupabaseAdapterConfig = {}) =>
  createAdapter({
    config: {
      adapterId: 'supabase-adapter',
      adapterName: 'Supabase Adapter',
      usePlural: false,
      debugLogs: config.debugLogs ?? false,
      supportsJSON: true,
      supportsDates: true,
      supportsBooleans: true,
      supportsNumericIds: false, // Using UUIDs
    },
    adapter: ({ debugLog }) => {
      // Field mapping: BetterAuth camelCase -> Database snake_case
      const fieldMapping: Record<string, string> = {
        userId: 'user_id',
        accountId: 'account_id',
        providerId: 'provider_id',
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        idToken: 'id_token',
        accessTokenExpiresAt: 'access_token_expires_at',
        refreshTokenExpiresAt: 'refresh_token_expires_at',
        emailVerified: 'email_verified',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        expiresAt: 'expires_at',
        ipAddress: 'ip_address',
        userAgent: 'user_agent',
        sedarNumber: 'sedar_number',
        fullName: 'full_name',
        assignedCodes: 'assigned_codes',
        phoneNumber: 'phone_number'
      }

      const mapFieldName = (field: string): string => {
        return fieldMapping[field] || field
      }

      const mapDataFields = (data: any): any => {
        if (!data || typeof data !== 'object') return data
        
        const mappedData: any = {}
        Object.entries(data).forEach(([key, value]) => {
          const dbField = mapFieldName(key)
          mappedData[dbField] = value
        })
        return mappedData
      }

      // Reverse mapping: Database snake_case -> BetterAuth camelCase
      const reverseFieldMapping: Record<string, string> = {
        user_id: 'userId',
        account_id: 'accountId',
        provider_id: 'providerId',
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
        id_token: 'idToken',
        access_token_expires_at: 'accessTokenExpiresAt',
        refresh_token_expires_at: 'refreshTokenExpiresAt',
        email_verified: 'emailVerified',
        created_at: 'createdAt',
        updated_at: 'updatedAt',
        expires_at: 'expiresAt',
        ip_address: 'ipAddress',
        user_agent: 'userAgent',
        sedar_number: 'sedarNumber',
        full_name: 'fullName',
        assigned_codes: 'assignedCodes',
        phone_number: 'phoneNumber'
      }

      const mapResultFields = (data: any): any => {
        if (!data) return data
        
        if (Array.isArray(data)) {
          return data.map(item => mapResultFields(item))
        }
        
        if (typeof data === 'object') {
          const mappedData: any = {}
          Object.entries(data).forEach(([key, value]) => {
            const camelField = reverseFieldMapping[key] || key
            mappedData[camelField] = value
          })
          return mappedData
        }
        
        return data
      }
      const buildWhereClause = (query: any, where?: any) => {
        if (!where) return query
        
        // Handle BetterAuth where format (array of conditions)
        if (Array.isArray(where)) {
          where.forEach((condition: any) => {
            const dbField = mapFieldName(condition.field)
            if (condition.operator === 'eq') {
              query = query.eq(dbField, condition.value)
            }
            // Add more operators as needed
          })
        } else {
          // Handle simple object format
          Object.entries(where).forEach(([key, value]) => {
            const dbField = mapFieldName(key)
            query = query.eq(dbField, value)
          })
        }
        
        return query
      }

      return {
        async create({ model, data, select }: any) {
          debugLog && debugLog(`Creating ${model}:`, data)
          
          const mappedData = mapDataFields(data)
          
          let selectQuery = '*'
          if (select && select.length > 0) {
            selectQuery = select.join(', ')
          }
          
          const { data: result, error } = await supabase
            .from(model)
            .insert(mappedData)
            .select(selectQuery)
            .single()
          
          if (error) {
            debugLog && debugLog(`Error creating ${model}:`, error)
            throw error
          }
          
          debugLog && debugLog(`Created ${model}:`, result)
          return mapResultFields(result)
        },

        async findOne({ model, where, select }: any) {
          debugLog && debugLog(`Finding one ${model}:`, { where, select })
          
          let selectQuery = '*'
          if (select && select.length > 0) {
            selectQuery = select.join(', ')
          }
          
          let query = supabase.from(model).select(selectQuery)
          query = buildWhereClause(query, where)
          
          const { data, error } = await query.single()
          
          if (error) {
            if (error.code === 'PGRST116') {
              debugLog && debugLog(`${model} not found`)
              return null
            }
            debugLog && debugLog(`Error finding ${model}:`, error)
            throw error
          }
          
          debugLog && debugLog(`Found ${model}:`, data)
          return mapResultFields(data)
        },

        async findMany({ model, where, limit, offset, sortBy, select }: any) {
          debugLog && debugLog(`Finding many ${model}:`, { where, limit, offset, sortBy, select })
          
          let selectQuery = '*'
          if (select && select.length > 0) {
            selectQuery = select.join(', ')
          }
          
          let query = supabase.from(model).select(selectQuery)
          query = buildWhereClause(query, where)
          
          if (limit) query = query.limit(limit)
          if (offset) query = query.range(offset, offset + (limit || 1000) - 1)
          if (sortBy) {
            // Handle sortBy - could be string or object
            if (typeof sortBy === 'string') {
              query = query.order(sortBy)
            } else if (sortBy && typeof sortBy === 'object') {
              Object.entries(sortBy).forEach(([field, direction]) => {
                query = query.order(field, { ascending: direction === 'asc' })
              })
            }
          }
          
          const { data, error } = await query
          
          if (error) {
            debugLog && debugLog(`Error finding many ${model}:`, error)
            throw error
          }
          
          debugLog && debugLog(`Found ${data?.length || 0} ${model} records`)
          return mapResultFields(data || [])
        },

        async update({ model, where, update, select }: any) {
          debugLog && debugLog(`Updating ${model}:`, { where, update })
          
          const mappedUpdate = mapDataFields(update)
          
          let selectQuery = '*'
          if (select && select.length > 0) {
            selectQuery = select.join(', ')
          }
          
          let query = supabase.from(model).update(mappedUpdate)
          query = buildWhereClause(query, where)
          
          const { data, error } = await query.select(selectQuery).single()
          
          if (error) {
            debugLog && debugLog(`Error updating ${model}:`, error)
            throw error
          }
          
          debugLog && debugLog(`Updated ${model}:`, data)
          return mapResultFields(data)
        },

        async updateMany({ model, where, update }: any) {
          debugLog && debugLog(`Updating many ${model}:`, { where, update })
          
          const mappedUpdate = mapDataFields(update)
          let query = supabase.from(model).update(mappedUpdate)
          
          query = buildWhereClause(query, where)
          
          const { count, error } = await query
          
          if (error) {
            debugLog && debugLog(`Error updating many ${model}:`, error)
            throw error
          }
          
          debugLog && debugLog(`Updated ${count || 0} ${model} records`)
          return count || 0
        },

        async delete({ model, where }: any) {
          debugLog && debugLog(`Deleting ${model}:`, where)
          
          let query = supabase.from(model).delete()
          
          query = buildWhereClause(query, where)
          
          const { error } = await query
          
          if (error) {
            debugLog && debugLog(`Error deleting ${model}:`, error)
            throw error
          }
          
          debugLog && debugLog(`Deleted ${model}`)
        },

        async deleteMany({ model, where }: any) {
          debugLog && debugLog(`Deleting many ${model}:`, where)
          
          let query = supabase.from(model).delete()
          
          query = buildWhereClause(query, where)
          
          const { count, error } = await query
          
          if (error) {
            debugLog && debugLog(`Error deleting many ${model}:`, error)
            throw error
          }
          
          debugLog && debugLog(`Deleted ${count || 0} ${model} records`)
          return count || 0
        },

        async count({ model, where }: any) {
          debugLog && debugLog(`Counting ${model}:`, where)
          
          let query = supabase.from(model).select('*', { count: 'exact', head: true })
          
          query = buildWhereClause(query, where)
          
          const { count, error } = await query
          
          if (error) {
            debugLog && debugLog(`Error counting ${model}:`, error)
            throw error
          }
          
          debugLog && debugLog(`Counted ${count || 0} ${model} records`)
          return count || 0
        }
      }
    }
  })