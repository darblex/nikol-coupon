import { collectFromElements, fetchPage, loadHtml, ScrapedCoupon } from './utils';

const URL = 'https://www.coupert.com/shop/shein.com';
const SOURCE = 'coupert.com';

export async function scrapeCoupert(): Promise<ScrapedCoupon[]> {
  try {
    const html = await fetchPage(URL);
    const $ = loadHtml(html);
    const cards = $('.coupon-code, .code, .offer, .coupon').toArray();
    let coupons = collectFromElements($, cards, 'shein', URL, SOURCE);
    if (coupons.length === 0) {
      const body = $('body').toArray();
      coupons = collectFromElements($, body, 'shein', URL, SOURCE);
    }
    return coupons;
  } catch (err) {
    console.error('scrapeCoupert error', err);
    return [];
  }
}
