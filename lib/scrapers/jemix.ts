import { collectFromElements, fetchPage, loadHtml, ScrapedCoupon } from './utils';

const URL = 'https://www.jemix.co.il/terminalx';
const SOURCE = 'jemix.co.il';

export async function scrapeJemix(): Promise<ScrapedCoupon[]> {
  try {
    const html = await fetchPage(URL);
    const $ = loadHtml(html);
    const candidates = [
      ...$('.coupon-code').toArray(),
      ...$('code').toArray(),
      ...$('strong').toArray(),
      ...$('b').toArray(),
      ...$('.code').toArray(),
      ...$('h2').toArray(),
    ];
    let coupons = collectFromElements($, candidates, 'terminalx', URL, SOURCE);
    if (coupons.length === 0) {
      const textBlocks = $('body').toArray();
      coupons = collectFromElements($, textBlocks, 'terminalx', URL, SOURCE);
    }
    return coupons;
  } catch (err) {
    console.error('scrapeJemix error', err);
    return [];
  }
}
