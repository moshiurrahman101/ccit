import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenEdge } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/courses', '/blog', '/contact', '/about', '/mentors', '/batches'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  
  // Dashboard routes that require authentication
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  
  // Admin routes that require admin authentication
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  // Student management API routes that require admin authentication (except invoices)
  const isStudentApiRoute = request.nextUrl.pathname.startsWith('/api/students') && 
    !request.nextUrl.pathname.startsWith('/api/students/invoices') &&
    !request.nextUrl.pathname.startsWith('/api/students/check-enrollment');
  
  // Batch management API routes that require admin authentication
  const isBatchApiRoute = request.nextUrl.pathname.startsWith('/api/batches') && 
    !request.nextUrl.pathname.startsWith('/api/batches/active') &&
    !request.nextUrl.pathname.startsWith('/api/batches/slug');
  
  // User management API routes that require admin authentication
  const isUserApiRoute = request.nextUrl.pathname.startsWith('/api/users');
  
  // Check if user is authenticated
  let isAuthenticated = false;
  let userRole = null;
  
  if (token) {
    const payload = verifyTokenEdge(token);
    if (payload) {
      isAuthenticated = true;
      userRole = payload.role;
      
      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-role', payload.role);
      
      // If user is authenticated and trying to access login/register, redirect to dashboard
      if (isPublicRoute && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // If user is trying to access admin routes but is not admin
      if (isAdminRoute && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // If user is trying to access student API routes but is not admin
      if (isStudentApiRoute && userRole !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      // If user is trying to access batch API routes but is not admin
      if (isBatchApiRoute && userRole !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      // If user is trying to access user API routes but is not admin
      if (isUserApiRoute && userRole !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }
  
  // Student invoice and enrollment check routes that require student authentication
  const isStudentInvoiceRoute = request.nextUrl.pathname.startsWith('/api/students/invoices') ||
    request.nextUrl.pathname.startsWith('/api/students/check-enrollment');
  
  // If not authenticated and trying to access protected routes
  if ((isDashboardRoute || isAdminRoute || isStudentApiRoute || isBatchApiRoute || isStudentInvoiceRoute) && !isAuthenticated) {
    if (isStudentApiRoute || isBatchApiRoute || isStudentInvoiceRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/login',
    '/register',
    '/api/auth/me',
    '/api/courses/:path*',
    '/api/enrollments/:path*',
    '/api/students',
    '/api/students/:path*',
    '/api/batches',
    '/api/batches/:path*',
    '/api/users',
    '/api/users/:path*'
  ]
};
