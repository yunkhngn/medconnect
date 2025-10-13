import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  const authToken = request.cookies.get('authToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  // Auto-redirect base role paths to their home pages
  if (path === '/admin') {
    return NextResponse.redirect(new URL('/admin/trang-chu', request.url));
  }
  if (path === '/bac-si') {
    return NextResponse.redirect(new URL('/bac-si/trang-chu', request.url));
  }
  if (path === '/nguoi-dung') {
    return NextResponse.redirect(new URL('/nguoi-dung/trang-chu', request.url));
  }

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
      return NextResponse.redirect(new URL(getRoleHome(userRole), request.url));
    }
    if (isDoctorRoute && userRole !== 'DOCTOR') {
      return NextResponse.redirect(new URL(getRoleHome(userRole), request.url));
    }
    if (isPatientRoute && userRole !== 'PATIENT') {
      return NextResponse.redirect(new URL(getRoleHome(userRole), request.url));
    }
  }

  return NextResponse.next();
}

function getRoleHome(role) {
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
  matcher: ['/admin/:path*', '/bac-si/:path*', '/nguoi-dung/:path*', '/admin', '/bac-si', '/nguoi-dung'],
};
