import { collectFromElements, fetchPage, loadHtml, ScrapedCoupon } from './utils';

const BASE = 'https://couponfollow.com/site';
const SOURCE = 'couponfollow.com';

const targets = [
  { store: 'asos', slug: 'asos.com' },
  { store: 'shein', slug: 'shein.com' },
];

export async function scrapeCouponFollow(): Promise<ScrapedCoupon[]> {
  const results: ScrapedCoupon[] = [];
  for (const t of targets) {
    const url = `${BASE}/${t.slug}`;
    try {
      const html = await fetchPage(url);
      const $ = loadHtml(html);
      const cards = $('.coupon, .deal, .offer-card, .coupon-card, .code').toArray();
      const coupons = collectFromElements($, cards, t.store as 'asos' | 'shein', url, SOURCE);
      results.push(...coupons);
    } catch (err) {
      console.error('scrapeCouponFollow error', t.slug, err);
    }
  }
  return results;
}
