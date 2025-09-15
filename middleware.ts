import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/courses', '/blog'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  
  // Dashboard routes that require authentication
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  
  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-role', payload.role);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/auth/me',
    '/api/courses/:path*',
    '/api/enrollments/:path*'
  ]
};
