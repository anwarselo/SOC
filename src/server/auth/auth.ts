import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // No email verification required
  },
  user: {
    additionalFields: {
      sedarNumber: {
        type: 'string',
        required: false,
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'agent',
      },
      fullName: {
        type: 'string', 
        required: false,
      },
      assignedCodes: {
        type: 'string', // JSON string of array
        required: false,
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
  },
  secret: process.env.BETTER_AUTH_SECRET || 'fallback-secret-change-in-production',
  plugins: [nextCookies()],
  advanced: {
    generateId: () => crypto.randomUUID(), // Use standard UUIDs
  }
})