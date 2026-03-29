import { collectFromElements, fetchPage, loadHtml, ScrapedCoupon } from './utils';

const URL = 'https://www.israelcoupon.co.il/terminalx-coupon';
const SOURCE = 'israelcoupon.co.il';

export async function scrapeIsraelCoupon(): Promise<ScrapedCoupon[]> {
  try {
    const html = await fetchPage(URL);
    const $ = loadHtml(html);
    const candidates = [
      ...$('.coupon-code').toArray(),
      ...$('.code').toArray(),
      ...$('code').toArray(),
      ...$('strong').toArray(),
      ...$('b').toArray(),
      ...$('h2').toArray(),
    ];
    let coupons = collectFromElements($, candidates, 'terminalx', URL, SOURCE);

    if (coupons.length === 0) {
      const bodyText = $('body').text();
      coupons = collectFromElements($, [$('body').get(0)!], 'terminalx', URL, SOURCE);
      // fallback: ensure only body text collected codes
      coupons = coupons.map((c) => ({ ...c, description: bodyText.trim() }));
    }

    return coupons;
  } catch (err) {
    console.error('scrapeIsraelCoupon error', err);
    return [];
  }
}
