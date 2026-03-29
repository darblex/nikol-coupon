import { collectFromElements, fetchPage, loadHtml, ScrapedCoupon } from './utils';

const URL = 'https://www.couponim.co.il/terminalx';
const SOURCE = 'couponim.co.il';

export async function scrapeCouponim(): Promise<ScrapedCoupon[]> {
  try {
    const html = await fetchPage(URL);
    const $ = loadHtml(html);
    const candidates = [
      ...$('.coupon-code').toArray(),
      ...$('.code').toArray(),
      ...$('code').toArray(),
      ...$('strong').toArray(),
      ...$('b').toArray(),
      ...$('h3').toArray(),
    ];
    let coupons = collectFromElements($, candidates, 'terminalx', URL, SOURCE);
    if (coupons.length === 0) {
      const blocks = $('.coupon, .deal, .offer').toArray();
      coupons = collectFromElements($, blocks, 'terminalx', URL, SOURCE);
    }
    return coupons;
  } catch (err) {
    console.error('scrapeCouponim error', err);
    return [];
  }
}
