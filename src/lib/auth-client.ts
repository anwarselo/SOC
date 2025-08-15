import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  fetchOptions: {
    onError(context) {
      if (context.response.status === 401) {
        // Handle unauthorized errors
        console.error('Authentication error:', context.error)
      }
    },
  },
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient