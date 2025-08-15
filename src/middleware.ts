import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const demoSession = request.cookies.get('demo-session');
	const isAppPath = request.nextUrl.pathname.startsWith('/app')
	
	// Allow access if either Better Auth session exists OR demo session exists
	if (isAppPath && !sessionCookie && !demoSession) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	return NextResponse.next();
}

export const config = { 
  matcher: ['/app/:path*'],
  runtime: "nodejs"
}