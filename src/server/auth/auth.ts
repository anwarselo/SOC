import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { supabaseAdapter } from '../db/supabase-adapter'

// Final test - restore Supabase adapter as BetterAuth may require database
export const auth = betterAuth({
  database: supabaseAdapter({
    debugLogs: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  secret: process.env.BETTER_AUTH_SECRET || 'fallback-secret-change-in-production',
  plugins: [nextCookies()],
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ]
})