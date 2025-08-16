// Debug and test BetterAuth route handlers
import { auth } from '../../../../server/auth/auth'

console.log('🔍 Available auth methods:', Object.keys(auth))

// Test direct handler approach
export async function GET(request: Request) {
  console.log('🔍 GET handler called:', request.url)
  try {
    return await auth.handler(request)
  } catch (error) {
    console.error('🚨 GET Error:', error)
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
  }
}

export async function POST(request: Request) {
  console.log('🔍 POST handler called:', request.url)
  try {
    return await auth.handler(request)
  } catch (error) {
    console.error('🚨 POST Error:', error)
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
  }
}