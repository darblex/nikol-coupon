import { deactivateOldCoupons, upsertCoupon } from '../db';
import { scrapeIsraelCoupon } from './israelcoupon';
import { scrapeCouponCode } from './couponcode';
import { scrapePromoCode } from './promocode';
import { scrapeJemix } from './jemix';
import { scrapeCouponim } from './couponim';
import { scrapeRetailMeNot } from './retailmenot';
import { scrapeCoupert } from './coupert';
import { scrapeCouponFollow } from './couponfollow';
import { scrapeCouponsDotCom } from './couponsdotcom';
import { scrapeDealspotr } from './dealspotr';
import { scrapeReddit } from './reddit';
import { scrapeHoney } from './honey';
import { ScrapedCoupon } from './utils';

const SCRAPERS: { name: string; fn: () => Promise<ScrapedCoupon[]> }[] = [
  { name: 'israelcoupon', fn: scrapeIsraelCoupon },
  { name: 'couponcode', fn: scrapeCouponCode },
  { name: 'promocode', fn: scrapePromoCode },
  { name: 'jemix', fn: scrapeJemix },
  { name: 'couponim', fn: scrapeCouponim },
  { name: 'retailmenot', fn: scrapeRetailMeNot },
  { name: 'coupert', fn: scrapeCoupert },
  { name: 'couponfollow', fn: scrapeCouponFollow },
  { name: 'coupons.com', fn: scrapeCouponsDotCom },
  { name: 'dealspotr', fn: scrapeDealspotr },
  { name: 'reddit', fn: scrapeReddit },
  { name: 'honey', fn: scrapeHoney },
];

export async function runAllScrapers(): Promise<{ total: number; errors: string[] }> {
  const errors: string[] = [];
  let total = 0;
  for (const scraper of SCRAPERS) {
    try {
      const items = await scraper.fn();
      items.forEach((c) => {
        upsertCoupon({
          ...c,
          first_seen: Date.now(),
          last_verified: Date.now(),
          works_count: 0,
          fails_count: 0,
          is_active: 1,
        });
      });
      total += items.length;
      console.log(`[scraper:${scraper.name}] inserted/updated ${items.length}`);
    } catch (err: any) {
      console.error(`[scraper:${scraper.name}] failed`, err);
      errors.push(`${scraper.name}: ${err?.message || String(err)}`);
    }
  }
  deactivateOldCoupons(14);
  if (errors.length) {
    console.error('Scraper errors', errors);
  }
  return { total, errors };
}
