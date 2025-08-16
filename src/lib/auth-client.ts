import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Supabase Auth wrapper functions for compatibility
export const signIn = {
  email: async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { error: result.error, data: null }
    }
    
    return { data: result, error: null }
  }
}

export const signUp = {
  email: async ({ email, password, fullName, sedarNumber, phoneNumber }: {
    email: string
    password: string
    fullName: string
    sedarNumber: string
    phoneNumber: string
  }) => {
    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName, sedarNumber, phoneNumber }),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      return { error: result.error, data: null }
    }
    
    return { data: result, error: null }
  }
}

export const signOut = async () => {
  const token = localStorage.getItem('accessToken')
  if (!token) return { error: null }
  
  const response = await fetch('/api/auth/signout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  // Clear local storage
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userId')
  localStorage.removeItem('userName')
  localStorage.removeItem('sedarNumber')
  localStorage.removeItem('assignedCodes')
  localStorage.removeItem('accessToken')
  
  return { error: null }
}

export const getSession = async () => {
  const token = localStorage.getItem('accessToken')
  if (!token) return { data: { session: null }, error: null }
  
  const response = await fetch('/api/auth/session', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!response.ok) {
    return { data: { session: null }, error: 'Invalid session' }
  }
  
  const result = await response.json()
  return { data: { session: { user: result.user } }, error: null }
}

// React hook for session (simplified)
export const useSession = () => {
  const isAuthenticated = typeof window !== 'undefined' ? localStorage.getItem('isAuthenticated') === 'true' : false
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
  
  return {
    data: isAuthenticated ? {
      session: {
        user: {
          id: userId,
          name: userName,
          role: userRole
        }
      }
    } : { session: null },
    isPending: false,
    error: null
  }
}