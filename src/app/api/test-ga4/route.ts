import { NextResponse } from 'next/server';
import { getGA4Stats } from '@/lib/ga4';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stats = await getGA4Stats();
  return NextResponse.json({ stats });
}
