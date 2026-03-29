import { collectFromElements, fetchPage, loadHtml, ScrapedCoupon } from './utils';

const SOURCE = 'retailmenot.com';
const targets = [
  { store: 'asos', url: 'https://www.retailmenot.com/view/asos.com' },
  { store: 'shein', url: 'https://www.retailmenot.com/view/shein.com' },
];

export async function scrapeRetailMeNot(): Promise<ScrapedCoupon[]> {
  const results: ScrapedCoupon[] = [];
  for (const t of targets) {
    try {
      const html = await fetchPage(t.url);
      const $ = loadHtml(html);
      const cards = $('.offer-card, .coupon').toArray();
      const coupons = collectFromElements($, cards, t.store as 'asos' | 'shein', t.url, SOURCE);
      results.push(...coupons);
    } catch (err) {
      console.error('scrapeRetailMeNot error', t.url, err);
    }
  }
  return results;
}
