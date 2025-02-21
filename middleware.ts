import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the session cookie
  const session = request.cookies.get('session');
  const requestPath = request.nextUrl.pathname;

  // Paths that require authentication
  const protectedPaths = ['/account'];
  
  // Paths that should be accessible only during onboarding
  const onboardingPaths = ['/account/onboarding', '/account/onboarding/success'];

  // If user is logged in (has session cookie)
  if (session) {
    return NextResponse.next();
  }

  // If user is not logged in and trying to access protected paths
  if (protectedPaths.some(path => requestPath.startsWith(path))) {
    // Instead of redirecting to login, redirect to home page
    // The modal will handle the login flow
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Add the current path to headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/account/:path*', // Matches all paths under /account
  ]
}; 