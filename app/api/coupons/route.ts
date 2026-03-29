import { NextRequest, NextResponse } from 'next/server';
import { getAllCoupons, initDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  initDb();
  const { searchParams } = new URL(req.url);
  const store = searchParams.get('store') as 'shein' | 'asos' | 'terminalx' | null;
  const coupons = getAllCoupons(store || undefined);
  return NextResponse.json({ coupons, lastUpdated: new Date().toISOString() });
}
