import { collectFromElements, fetchPage, loadHtml, ScrapedCoupon } from './utils';

const SOURCE = 'honey.com';
const targets = [
  { store: 'asos', url: 'https://www.joinhoney.com/shop/asos' },
  { store: 'shein', url: 'https://www.joinhoney.com/shop/shein' },
  { store: 'terminalx', url: 'https://www.joinhoney.com/shop/terminalx' },
];

export async function scrapeHoney(): Promise<ScrapedCoupon[]> {
  const results: ScrapedCoupon[] = [];
  for (const t of targets) {
    try {
      const html = await fetchPage(t.url);
      const $ = loadHtml(html);
      const cards = $('.coupon-code, .code, .offer, .deal, .promo').toArray();
      const coupons = collectFromElements($, cards, t.store as 'asos' | 'shein' | 'terminalx', t.url, SOURCE);
      results.push(...coupons);
    } catch (err) {
      console.error('scrapeHoney error', t.url, err);
    }
  }
  return results;
}
