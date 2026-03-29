import { collectFromElements, fetchPage, loadHtml, ScrapedCoupon } from './utils';

const URL = 'https://www.coupons.com/store/shein-coupons/';
const SOURCE = 'coupons.com';

export async function scrapeCouponsDotCom(): Promise<ScrapedCoupon[]> {
  try {
    const html = await fetchPage(URL);
    const $ = loadHtml(html);
    const cards = $('.offer-card, .coupon, .offer, .code').toArray();
    let coupons = collectFromElements($, cards, 'shein', URL, SOURCE);
    if (coupons.length === 0) {
      const body = $('body').toArray();
      coupons = collectFromElements($, body, 'shein', URL, SOURCE);
    }
    return coupons;
  } catch (err) {
    console.error('scrapeCouponsDotCom error', err);
    return [];
  }
}
