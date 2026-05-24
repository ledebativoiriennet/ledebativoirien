import { NextResponse } from 'next/server';
import { sendMonthlyDigest } from '@/lib/digest-actions';

export async function GET(request: Request) {
  // Security check for CRON (optional but recommended)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendMonthlyDigest();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erreur CRON Monthly Digest:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi du digest mensuel',
      details: error.message 
    }, { status: 500 });
  }
}
