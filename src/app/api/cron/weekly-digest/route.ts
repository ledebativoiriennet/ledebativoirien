import { NextResponse } from 'next/server';
import { sendWeeklyDigest } from '@/lib/digest-actions';

export async function GET(request: Request) {
  // Security check for CRON (optional but recommended)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendWeeklyDigest();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erreur CRON Weekly Digest:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi du digest hebdomadaire',
      details: error.message 
    }, { status: 500 });
  }
}
