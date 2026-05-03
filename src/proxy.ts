import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute for sensitive routes

export function proxy(request: NextRequest) {
  const ip = request.headers.get('x-real-ip') || 
             request.headers.get('x-forwarded-for')?.split(',')[0] || 
             '127.0.0.1';
  const path = request.nextUrl.pathname;

  // Only rate limit auth routes
  if (path.startsWith('/api/auth') || path.startsWith('/login') || path.startsWith('/register')) {
    const now = Date.now();
    const limit = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - limit.lastReset > RATE_LIMIT_WINDOW) {
      limit.count = 1;
      limit.lastReset = now;
    } else {
      limit.count++;
    }

    rateLimitMap.set(ip, limit);

    if (limit.count > MAX_REQUESTS) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/:path*', '/login', '/register'],
};
