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
  
  // Student management API routes that require admin authentication (except invoices and check-enrollment)
  const isStudentApiRoute = request.nextUrl.pathname.startsWith('/api/students') && 
    !request.nextUrl.pathname.includes('/invoices') &&
    !request.nextUrl.pathname.includes('/check-enrollment');
  
  // Batch management API routes that require admin authentication
  const isBatchApiRoute = request.nextUrl.pathname.startsWith('/api/batches') && 
    !request.nextUrl.pathname.startsWith('/api/batches/active') &&
    !request.nextUrl.pathname.startsWith('/api/batches/slug');
  
  // Mentor batch management API routes that require mentor authentication
  const isMentorBatchApiRoute = request.nextUrl.pathname.startsWith('/api/mentor/batches');
  
  // Mentor profile check API routes that require mentor authentication
  const isMentorProfileApiRoute = request.nextUrl.pathname.startsWith('/api/mentor/check-profile');
  
  // User management API routes that require admin authentication
  const isUserApiRoute = request.nextUrl.pathname.startsWith('/api/users');
  
  // Admin enrollment management API routes that require admin authentication
  const isAdminEnrollmentApiRoute = request.nextUrl.pathname.startsWith('/api/admin/enrollments');
  
  // Admin invoice management API routes that require admin authentication
  const isAdminInvoiceApiRoute = request.nextUrl.pathname.startsWith('/api/admin/invoices');
  
    // Admin student approval API routes that require admin authentication
    const isAdminStudentApprovalApiRoute = request.nextUrl.pathname.startsWith('/api/admin/student-approvals');
    
    // Payment API routes
    const isPaymentApiRoute = request.nextUrl.pathname.startsWith('/api/payments');
    const isAdminPaymentApiRoute = request.nextUrl.pathname.startsWith('/api/admin/payments');
  
  // Check if user is authenticated
  let isAuthenticated = false;
  let userRole = null;
  let payload = null;
  
  if (token) {
    payload = verifyTokenEdge(token);
    if (payload) {
      isAuthenticated = true;
      userRole = payload.role;
      
      // If user is authenticated and trying to access login/register, redirect to appropriate dashboard
      if (isPublicRoute && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
        // Redirect based on user role
        switch (userRole) {
          case 'admin':
          case 'marketing':
          case 'support':
            return NextResponse.redirect(new URL('/dashboard', request.url));
          case 'mentor':
            return NextResponse.redirect(new URL('/dashboard/mentor', request.url));
          case 'student':
            return NextResponse.redirect(new URL('/dashboard/student', request.url));
          default:
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
      
      // Role-based dashboard access control
      if (isDashboardRoute) {
        const path = request.nextUrl.pathname;
        
        // Admin dashboard - only admin, marketing, support
        if (path === '/dashboard' && !['admin', 'marketing', 'support'].includes(userRole)) {
          switch (userRole) {
            case 'mentor':
              return NextResponse.redirect(new URL('/dashboard/mentor', request.url));
            case 'student':
              return NextResponse.redirect(new URL('/dashboard/student', request.url));
            default:
              return NextResponse.redirect(new URL('/login', request.url));
          }
        }
        
        // Mentor dashboard - only mentor and admin
        if (path.startsWith('/dashboard/mentor') && !['mentor', 'admin'].includes(userRole)) {
          switch (userRole) {
            case 'student':
              return NextResponse.redirect(new URL('/dashboard/student', request.url));
            case 'admin':
            case 'marketing':
            case 'support':
              return NextResponse.redirect(new URL('/dashboard', request.url));
            default:
              return NextResponse.redirect(new URL('/login', request.url));
          }
        }
        
        // Student dashboard - only student and admin
        if (path.startsWith('/dashboard/student') && !['student', 'admin'].includes(userRole)) {
          switch (userRole) {
            case 'mentor':
              return NextResponse.redirect(new URL('/dashboard/mentor', request.url));
            case 'admin':
            case 'marketing':
            case 'support':
              return NextResponse.redirect(new URL('/dashboard', request.url));
            default:
              return NextResponse.redirect(new URL('/login', request.url));
          }
        }
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
      
      // If user is trying to access mentor batch API routes but is not admin or mentor
      if (isMentorBatchApiRoute && !['admin', 'mentor'].includes(userRole)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      // If user is trying to access mentor profile API routes but is not admin or mentor
      if (isMentorProfileApiRoute && !['admin', 'mentor'].includes(userRole)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      // If user is trying to access user API routes but is not admin
      if (isUserApiRoute && userRole !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      // If user is trying to access admin enrollment API routes but is not admin
      if (isAdminEnrollmentApiRoute && userRole !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      // If user is trying to access admin invoice API routes but is not admin
      if (isAdminInvoiceApiRoute && userRole !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
    // If user is trying to access admin student approval API routes but is not admin
    if (isAdminStudentApprovalApiRoute && !['admin', 'marketing'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // If user is trying to access admin payment API routes but is not admin
    if (isAdminPaymentApiRoute && !['admin', 'marketing'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
      
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
  
  // Student invoice and enrollment check routes that require student authentication
  const isStudentInvoiceRoute = request.nextUrl.pathname.includes('/api/students/invoices') ||
    request.nextUrl.pathname.includes('/api/students/check-enrollment');
  
  // Student batches API routes
  const isStudentBatchesRoute = request.nextUrl.pathname.startsWith('/api/student/batches');
  
  // If not authenticated and trying to access protected routes
    if ((isDashboardRoute || isAdminRoute || isStudentApiRoute || isBatchApiRoute || isMentorBatchApiRoute || isMentorProfileApiRoute || isStudentInvoiceRoute || isStudentBatchesRoute || isAdminEnrollmentApiRoute || isAdminInvoiceApiRoute || isAdminStudentApprovalApiRoute || isPaymentApiRoute || isAdminPaymentApiRoute) && !isAuthenticated) {
      if (isStudentApiRoute || isBatchApiRoute || isMentorBatchApiRoute || isMentorProfileApiRoute || isStudentInvoiceRoute || isStudentBatchesRoute || isAdminEnrollmentApiRoute || isAdminInvoiceApiRoute || isAdminStudentApprovalApiRoute || isPaymentApiRoute || isAdminPaymentApiRoute) {
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
    '/api/mentor/batches',
    '/api/mentor/batches/:path*',
    '/api/mentor/check-profile',
    '/api/users',
    '/api/users/:path*',
    '/api/admin/enrollments',
    '/api/admin/enrollments/:path*',
    '/api/admin/invoices',
    '/api/admin/invoices/:path*',
        '/api/admin/student-approvals',
        '/api/admin/student-approvals/:path*',
        '/api/payments',
        '/api/payments/:path*',
        '/api/admin/payments',
        '/api/admin/payments/:path*',
        '/api/student/batches',
        '/api/student/batches/:path*'
  ]
};
