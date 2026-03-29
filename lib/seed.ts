import { Coupon, Store, initDb, upsertCoupon, getAllCoupons } from './db';

const seedData: Record<Store, Array<{ code: string; description: string; discount_type: 'percent' | 'fixed' | 'free_shipping' | 'unknown'; discount_value?: string }>> = {
  terminalx: [
    { code: 'TERMINAL10', description: '10% הנחה על כל האתר', discount_type: 'percent', discount_value: '10' },
    { code: 'FOX15', description: '15% הנחה - קוד עובדים FOX', discount_type: 'percent', discount_value: '15' },
    { code: 'TX20', description: '20% הנחה על הזמנה ראשונה', discount_type: 'percent', discount_value: '20' },
    { code: 'WELCOME10', description: 'ברוכים הבאים - 10% הנחה', discount_type: 'percent', discount_value: '10' },
    { code: 'TX25', description: '25% הנחה בקנייה מעל ₪300', discount_type: 'percent', discount_value: '25' },
    { code: 'FREESHIPTX', description: 'משלוח חינם', discount_type: 'free_shipping' },
  ],
  asos: [
    { code: 'ASOS20', description: '20% off your order', discount_type: 'percent', discount_value: '20' },
    { code: 'STUDENT15', description: '15% student discount', discount_type: 'percent', discount_value: '15' },
    { code: 'WELCOME10', description: 'Welcome code - 10% off', discount_type: 'percent', discount_value: '10' },
    { code: 'NEW15', description: '15% off first order', discount_type: 'percent', discount_value: '15' },
    { code: 'FREESHIP', description: 'Free shipping', discount_type: 'free_shipping' },
    { code: 'APP20', description: '20% off via app', discount_type: 'percent', discount_value: '20' },
  ],
  shein: [
    { code: 'SHEIN15', description: '15% off sitewide', discount_type: 'percent', discount_value: '15' },
    { code: 'NEWUSER20', description: '20% off for new users', discount_type: 'percent', discount_value: '20' },
    { code: 'APP15', description: '15% off app orders', discount_type: 'percent', discount_value: '15' },
    { code: 'WELCOME25', description: '25% off welcome code', discount_type: 'percent', discount_value: '25' },
    { code: 'SAVE10', description: '10% off any order', discount_type: 'percent', discount_value: '10' },
    { code: 'SHEIN30', description: '30% off selected items', discount_type: 'percent', discount_value: '30' },
  ],
};

export function seedIfEmpty(): void {
  initDb();
  const existing = getAllCoupons();
  if (existing.length > 0) return;

  const now = Date.now();
  Object.entries(seedData).forEach(([store, items]) => {
    items.forEach((item) => {
      const coupon: Omit<Coupon, 'id'> = {
        store: store as Store,
        code: item.code,
        description: item.description,
        discount_type: item.discount_type,
        discount_value: item.discount_value ?? null,
        expiry: null,
        source_url: null,
        source_site: 'seed',
        first_seen: now,
        last_verified: now,
        works_count: Math.floor(Math.random() * 20),
        fails_count: Math.floor(Math.random() * 3),
        is_active: 1,
      };
      upsertCoupon(coupon);
    });
  });
}
