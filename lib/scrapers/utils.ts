import { load, CheerioAPI, Element } from 'cheerio';
import { DiscountType, NewCoupon, Store } from '../db';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

export interface ScrapedCoupon extends Omit<NewCoupon, 'id' | 'first_seen' | 'last_verified' | 'works_count' | 'fails_count' | 'is_active'> {
  expiry?: string | null;
  source_url?: string;
  source_site?: string;
  description?: string | null;
  discount_type?: DiscountType;
  discount_value?: string | null;
}

const FALSE_POSITIVES = new Set([
  'HTTP',
  'HTTPS',
  'HTML',
  'CSS',
  'JAVASCRIPT',
  'SCRIPT',
  'NEXTJS',
]);

export function extractCodes(text: string): string[] {
  const regex = /\b([A-Z0-9]{4,20})\b/g;
  const matches = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text.toUpperCase()))) {
    const code = m[1];
    if (FALSE_POSITIVES.has(code)) continue;
    matches.add(code);
  }
  return Array.from(matches);
}

export function parseDiscount(text: string): { discount_type: DiscountType; discount_value: string | null } {
  const percentMatch = /([0-9]{1,3})%/.exec(text);
  if (percentMatch) {
    return { discount_type: 'percent', discount_value: percentMatch[1] };
  }
  const shekelMatch = /₪\s*([0-9]{1,4})/.exec(text) || /NIS\s*([0-9]{1,4})/i.exec(text);
  if (shekelMatch) {
    return { discount_type: 'fixed', discount_value: shekelMatch[1] };
  }
  if (/free shipping/i.test(text)) {
    return { discount_type: 'free_shipping', discount_value: null };
  }
  return { discount_type: 'unknown', discount_value: null };
}

export async function fetchPage(url: string): Promise<string> {
  const delayMs = 1000 + Math.random() * 2000;
  await new Promise((res) => setTimeout(res, delayMs));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8',
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

export function collectFromElements(
  $: CheerioAPI,
  elements: Element[],
  store: Store,
  source_url: string,
  source_site: string
): ScrapedCoupon[] {
  const coupons: ScrapedCoupon[] = [];
  elements.forEach((el) => {
    const text = $(el).text().trim();
    if (!text) return;
    const codes = extractCodes(text);
    codes.forEach((code) => {
      const { discount_type, discount_value } = parseDiscount(text);
      coupons.push({
        store,
        code,
        description: text,
        discount_type,
        discount_value,
        expiry: null,
        source_url,
        source_site,
      });
    });
  });
  return coupons;
}

export function loadHtml(html: string): CheerioAPI {
  return load(html);
}
