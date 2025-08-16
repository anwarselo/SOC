import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	// Get Supabase session cookie
	const sessionCookie = request.cookies.get('supabase-session')?.value;
	const isAppPath = request.nextUrl.pathname.startsWith('/app')
	const isAuthPath = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
	const isPendingPath = request.nextUrl.pathname.startsWith('/pending-approval')
	
	// Parse session data from cookie
	let sessionData = null;
	if (sessionCookie) {
		try {
			sessionData = JSON.parse(sessionCookie);
		} catch (error) {
			console.error('Failed to parse session cookie:', error);
		}
	}
	
	// Redirect to login if accessing protected routes without session
	if (isAppPath && !sessionData) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// If user has a session and trying to access app routes, verify their approval status
	if (isAppPath && sessionData) {
		try {
			// Allow admin access (admins are always approved)
			if (sessionData.sedarNumber?.startsWith('ADMIN') || sessionData.role === 'admin') {
				return NextResponse.next();
			}
			
			// For regular users, check approval status
			if (sessionData.status !== 'approved') {
				// Redirect to pending page instead of login
				return NextResponse.redirect(new URL('/pending-approval', request.url));
			}
		} catch (error) {
			console.error('Middleware auth check error:', error);
			// If there's an error checking status, redirect to login
			return NextResponse.redirect(new URL('/login', request.url));
		}
	}

	// Redirect to app if already authenticated and trying to access auth pages
	if (isAuthPath && sessionData && !isPendingPath) {
		return NextResponse.redirect(new URL('/app/calls', request.url));
	}

	return NextResponse.next();
}

export const config = { 
  matcher: [
    // Exclude API routes from middleware to prevent conflicts
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
  runtime: "nodejs"
}