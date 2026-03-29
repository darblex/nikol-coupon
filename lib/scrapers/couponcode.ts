import { collectFromElements, fetchPage, loadHtml, ScrapedCoupon } from './utils';

const URL = 'https://www.couponcode.co.il/terminalx';
const SOURCE = 'couponcode.co.il';

export async function scrapeCouponCode(): Promise<ScrapedCoupon[]> {
  try {
    const html = await fetchPage(URL);
    const $ = loadHtml(html);
    const candidates = [
      ...$('.coupon-code').toArray(),
      ...$('.code').toArray(),
      ...$('pre').toArray(),
      ...$('code').toArray(),
      ...$('strong').toArray(),
      ...$('b').toArray(),
      ...$('h3').toArray(),
    ];
    let coupons = collectFromElements($, candidates, 'terminalx', URL, SOURCE);
    if (coupons.length === 0) {
      const blocks = $('.coupon, .offer, .card').toArray();
      coupons = collectFromElements($, blocks, 'terminalx', URL, SOURCE);
    }
    return coupons;
  } catch (err) {
    console.error('scrapeCouponCode error', err);
    return [];
  }
}
