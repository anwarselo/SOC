import { signUp } from '../src/lib/auth-client'
import { supabase } from '../src/lib/supabase'

async function createAdmin() {
  try {
    console.log('Creating admin account...')
    
    // Create admin user with BetterAuth
    const result = await signUp.email({
      email: 'admin@sedaroutreach.internal',
      password: 'admin123',
      name: 'System Administrator',
    })

    if (result.error) {
      console.error('Failed to create admin account:', result.error)
      return
    }

    console.log('Admin account created successfully:', result.data?.user?.id)

    // Update admin user with additional fields
    if (result.data?.user) {
      const { data, error } = await supabase
        .from('auth_user')
        .update({
          sedar_number: 'ADMIN',
          role: 'admin',
          status: 'approved',
          phone_number: '+97150000000',
          updated_at: new Date().toISOString()
        })
        .eq('id', result.data.user.id)
        .select()

      if (error) {
        console.error('Failed to update admin profile:', error)
      } else {
        console.log('Admin profile updated successfully')
        console.log('Login credentials: Employee ID: ADMIN, Password: admin123')
      }
    }
  } catch (error) {
    console.error('Error creating admin:', error)
  }
}

createAdmin()