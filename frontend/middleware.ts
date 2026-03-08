import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const ADMIN_PATHS = ['/admin', '/admin/users', '/admin/parcels', '/admin/riders', '/admin/dashboard'];
const ADMIN_LOGIN_PATH = '/login/admin';
const COOKIE_TOKEN = 'auth_token';
const COOKIE_USER = 'user_data';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the admin login page to load without auth
  if (pathname.startsWith(ADMIN_LOGIN_PATH)) {
    return NextResponse.next();
  }

  // Only protect admin routes
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    const token = request.cookies.get(COOKIE_TOKEN)?.value;
    const userCookie = request.cookies.get(COOKIE_USER)?.value;

    if (!token || !userCookie) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }

    // Prefer cookie role to avoid secret mismatch in middleware
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      const role = user?.role ? String(user.role).toUpperCase() : '';
      if (role === 'ADMIN' || role === 'STAFF') {
        return NextResponse.next();
      }
    } catch (err) {
      // Fall back to token verification below
    }

    try {
      const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || '';
      if (!secret) {
        return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
      }
      const decoded = jwt.verify(token, secret);
      const role = typeof decoded === 'object' ? (decoded as any).role : null;
      if (role && String(role).toUpperCase() === 'ADMIN') {
        return NextResponse.next();
      }
    } catch (err) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }

    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
