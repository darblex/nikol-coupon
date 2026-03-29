import { NextRequest, NextResponse } from 'next/server';
import { initDb, voteCoupon } from '@/lib/db';

type RouteParams = { params: { id: string } };

export async function POST(req: NextRequest, context: RouteParams) {
  initDb();
  const { worked } = (await req.json()) as { worked: boolean };
  const id = Number(context.params.id);
  const updated = voteCoupon(id, worked);
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ coupon: updated });
}
