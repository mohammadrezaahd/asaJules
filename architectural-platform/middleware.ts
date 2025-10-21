import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { Role } from './types/role';

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    if (pathname.startsWith('/dashboard')) {
      if (token.role !== Role.ADMIN) {
        if (pathname !== `/dashboard/profile/${token.id}`) {
          return NextResponse.redirect(new URL('/dashboard/profile/' + token.id, req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*'],
};
