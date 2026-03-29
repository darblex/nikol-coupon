import { NextRequest, NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { runAllScrapers } from '@/lib/scrapers';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  initDb();
  const { total, errors } = await runAllScrapers();
  return NextResponse.json({ scraped: total, errors });
}
