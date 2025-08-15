import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const isAppPath = request.nextUrl.pathname.startsWith('/app')
	const isAuthPath = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
	
	// Redirect to login if accessing protected routes without session
	if (isAppPath && !sessionCookie) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// Redirect to app if already authenticated and trying to access auth pages
	if (isAuthPath && sessionCookie) {
		return NextResponse.redirect(new URL('/app/calls', request.url));
	}

	return NextResponse.next();
}

export const config = { 
  matcher: ['/app/:path*', '/login', '/register'],
  runtime: "nodejs"
}