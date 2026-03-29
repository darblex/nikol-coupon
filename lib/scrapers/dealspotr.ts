import { collectFromElements, fetchPage, loadHtml, ScrapedCoupon } from './utils';

const SOURCE = 'dealspotr.com';
const targets = [
  { store: 'asos', url: 'https://dealspotr.com/promo-codes/asos.com' },
  { store: 'shein', url: 'https://dealspotr.com/promo-codes/shein.com' },
  { store: 'terminalx', url: 'https://dealspotr.com/promo-codes/terminalx.com' },
];

export async function scrapeDealspotr(): Promise<ScrapedCoupon[]> {
  const results: ScrapedCoupon[] = [];
  for (const t of targets) {
    try {
      const html = await fetchPage(t.url);
      const $ = loadHtml(html);
      const cards = $('.promo, .offer, .deal, .coupon, .code').toArray();
      const coupons = collectFromElements($, cards, t.store as 'asos' | 'shein' | 'terminalx', t.url, SOURCE);
      results.push(...coupons);
    } catch (err) {
      console.error('scrapeDealspotr error', t.url, err);
    }
  }
  return results;
}
