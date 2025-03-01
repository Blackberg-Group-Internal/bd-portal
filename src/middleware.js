import { NextResponse } from 'next/server';

export function middleware(request) {

  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dam', request.url));
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',    
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/api/:path*',
  ],
};
