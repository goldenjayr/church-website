import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userId = request.cookies.get('userId')?.value

  // Protected routes
  const isAdminRoute = pathname.startsWith('/admin')
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAuthRoute = pathname === '/login' || pathname === '/signup'

  // If user is not logged in
  if (!userId) {
    // Allow access to auth routes and public routes
    if (isAuthRoute || (!isAdminRoute && !isDashboardRoute)) {
      return NextResponse.next()
    }
    
    // Redirect to login for protected routes
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in
  if (userId) {
    // Redirect logged-in users away from auth pages
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // For admin routes, we'll need to check role on the page itself
    // since we can't access the database from middleware
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/signup',
  ]
}
