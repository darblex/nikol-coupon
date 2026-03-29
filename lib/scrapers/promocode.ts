import { collectFromElements, fetchPage, loadHtml, ScrapedCoupon } from './utils';

const URL = 'https://www.promocode.co.il/terminalx';
const SOURCE = 'promocode.co.il';

export async function scrapePromoCode(): Promise<ScrapedCoupon[]> {
  try {
    const html = await fetchPage(URL);
    const $ = loadHtml(html);
    const candidates = [
      ...$('.coupon-code').toArray(),
      ...$('.promo-code').toArray(),
      ...$('code').toArray(),
      ...$('strong').toArray(),
      ...$('b').toArray(),
      ...$('h2').toArray(),
      ...$('.coup-code').toArray(),
    ];
    let coupons = collectFromElements($, candidates, 'terminalx', URL, SOURCE);
    if (coupons.length === 0) {
      const blocks = $('.coupon, .card, .deal').toArray();
      coupons = collectFromElements($, blocks, 'terminalx', URL, SOURCE);
    }
    return coupons;
  } catch (err) {
    console.error('scrapePromoCode error', err);
    return [];
  }
}
