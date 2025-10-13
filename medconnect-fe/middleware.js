import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Get auth info from cookies or headers
  const authToken = request.cookies.get('authToken')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '');
  const userRole = request.cookies.get('userRole')?.value;

  // Public routes
  const publicRoutes = ['/', '/dang-nhap', '/dang-ky', '/quen-mat-khau', '/tim-bac-si', '/chinh-sach'];
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  // Protected routes
  const isAdminRoute = path.startsWith('/admin');
  const isDoctorRoute = path.startsWith('/bac-si');
  const isPatientRoute = path.startsWith('/nguoi-dung');

  // If not logged in and trying to access protected routes
  if (!authToken && (isAdminRoute || isDoctorRoute || isPatientRoute)) {
    return NextResponse.redirect(new URL('/dang-nhap', request.url));
  }

  // If logged in but wrong role
  if (authToken && userRole) {
    if (isAdminRoute && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleHomePage(userRole), request.url));
    }
    if (isDoctorRoute && userRole !== 'DOCTOR') {
      return NextResponse.redirect(new URL(getRoleHomePage(userRole), request.url));
    }
    if (isPatientRoute && userRole !== 'PATIENT') {
      return NextResponse.redirect(new URL(getRoleHomePage(userRole), request.url));
    }
  }

  return NextResponse.next();
}

function getRoleHomePage(role) {
  switch (role) {
    case 'ADMIN':
      return '/admin/trang-chu';
    case 'DOCTOR':
      return '/bac-si/trang-chu';
    case 'PATIENT':
      return '/nguoi-dung/trang-chu';
    default:
      return '/';
  }
}

export const config = {
  matcher: ['/admin/:path*', '/bac-si/:path*', '/nguoi-dung/:path*'],
};

// ✅ ĐÃ CÓ - This is enough!
