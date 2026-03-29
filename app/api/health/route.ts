import { NextResponse } from 'next/server';
import { initDb, getAllCoupons } from '@/lib/db';
import { seedIfEmpty } from '@/lib/seed';

export async function GET() {
  initDb();
  seedIfEmpty();
  const all = getAllCoupons();
  const totals: Record<string, number> = {};
  all.forEach((c) => { totals[c.store] = (totals[c.store] || 0) + 1; });
  return NextResponse.json({ totals, total: all.length });
}
