import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { detectBot, isBadBot } from './lib/bot-detector';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // Increased to 100 to avoid blocking legitimate users

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-real-ip') || 
             request.headers.get('x-forwarded-for')?.split(',')[0] || 
             '127.0.0.1';
  const path = request.nextUrl.pathname;

  // 1. Anti-Bot: Block bad bots
  if (isBadBot(userAgent)) {
    console.warn(`Blocked bad bot: ${userAgent} from IP: ${ip}`);
    return new NextResponse('Access Denied', { status: 403 });
  }

  // 2. Identify Good Bots
  const botInfo = detectBot(userAgent);
  const response = NextResponse.next();
  
  if (botInfo.isBot) {
    response.headers.set('X-Is-Bot', 'true');
    response.headers.set('X-Bot-Name', botInfo.name || 'Unknown');
  }

  // 3. Existing Rate Limiting for auth routes
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

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
