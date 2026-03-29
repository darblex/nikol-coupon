import fs from 'fs';
import path from 'path';

export type Store = 'shein' | 'asos' | 'terminalx';
export type DiscountType = 'percent' | 'fixed' | 'free_shipping' | 'unknown';

export interface Coupon {
  id: number;
  store: Store;
  code: string;
  description?: string | null;
  discount_type?: DiscountType | null;
  discount_value?: string | null;
  expiry?: string | null;
  source_url?: string | null;
  source_site?: string | null;
  first_seen: number;
  last_verified: number;
  works_count: number;
  fails_count: number;
  is_active: number;
}

export type NewCoupon = Omit<Coupon, 'id'>;

const dbFile = path.join(process.cwd(), 'data', 'coupons.json');

interface DbStore {
  nextId: number;
  coupons: Coupon[];
}

function ensureDir() {
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readDb(): DbStore {
  ensureDir();
  if (!fs.existsSync(dbFile)) return { nextId: 1, coupons: [] };
  try {
    return JSON.parse(fs.readFileSync(dbFile, 'utf-8')) as DbStore;
  } catch {
    return { nextId: 1, coupons: [] };
  }
}

function writeDb(store: DbStore) {
  ensureDir();
  fs.writeFileSync(dbFile, JSON.stringify(store, null, 2), 'utf-8');
}

export function initDb() {
  if (!fs.existsSync(dbFile)) writeDb({ nextId: 1, coupons: [] });
}

export function getAllCoupons(store?: Store): Coupon[] {
  const db = readDb();
  const active = db.coupons.filter(c => c.is_active === 1);
  const filtered = store ? active.filter(c => c.store === store) : active;
  return filtered.sort((a, b) => b.last_verified - a.last_verified);
}

export function upsertCoupon(coupon: NewCoupon): void {
  const db = readDb();
  const now = Date.now();
  const idx = db.coupons.findIndex(c => c.store === coupon.store && c.code === coupon.code);

  if (idx >= 0) {
    db.coupons[idx] = {
      ...db.coupons[idx],
      description: coupon.description ?? db.coupons[idx].description,
      discount_type: coupon.discount_type ?? db.coupons[idx].discount_type,
      discount_value: coupon.discount_value ?? db.coupons[idx].discount_value,
      expiry: coupon.expiry ?? db.coupons[idx].expiry,
      source_url: coupon.source_url ?? db.coupons[idx].source_url,
      source_site: coupon.source_site ?? db.coupons[idx].source_site,
      last_verified: now,
      is_active: 1,
    };
  } else {
    db.coupons.push({
      id: db.nextId++,
      store: coupon.store,
      code: coupon.code,
      description: coupon.description ?? null,
      discount_type: coupon.discount_type ?? 'unknown',
      discount_value: coupon.discount_value ?? null,
      expiry: coupon.expiry ?? null,
      source_url: coupon.source_url ?? null,
      source_site: coupon.source_site ?? null,
      first_seen: now,
      last_verified: now,
      works_count: 0,
      fails_count: 0,
      is_active: 1,
    });
  }
  writeDb(db);
}

export function voteCoupon(id: number, worked: boolean): Coupon | null {
  const db = readDb();
  const idx = db.coupons.findIndex(c => c.id === id);
  if (idx < 0) return null;
  if (worked) db.coupons[idx].works_count++;
  else db.coupons[idx].fails_count++;
  writeDb(db);
  return db.coupons[idx];
}

export function deactivateOldCoupons(olderThanDays: number): void {
  const db = readDb();
  const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
  db.coupons.forEach(c => { if (c.last_verified < cutoff) c.is_active = 0; });
  writeDb(db);
}
