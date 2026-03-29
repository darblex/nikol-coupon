import { extractCodes, parseDiscount, ScrapedCoupon } from './utils';

const SUBS = ['fashiondeals', 'frugalfemalefashion'];
const SOURCE = 'reddit.com';

function inferStore(text: string): 'asos' | 'shein' | 'terminalx' | null {
  const t = text.toLowerCase();
  if (t.includes('asos')) return 'asos';
  if (t.includes('shein')) return 'shein';
  if (t.includes('terminalx') || t.includes('terminal x')) return 'terminalx';
  return null;
}

export async function scrapeReddit(): Promise<ScrapedCoupon[]> {
  const results: ScrapedCoupon[] = [];
  for (const sub of SUBS) {
    const url = `https://www.reddit.com/r/${sub}/new.json?limit=30`;
    try {
      // random delay 1-3s
      await new Promise((res) => setTimeout(res, 1000 + Math.random() * 2000));
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as any;
      const posts: any[] = data?.data?.children ?? [];
      posts.forEach((p) => {
        const post = p?.data;
        if (!post) return;
        const text = `${post.title || ''}\n${post.selftext || ''}`;
        const store = inferStore(text);
        if (!store) return;
        const codes = extractCodes(text);
        codes.forEach((code) => {
          const { discount_type, discount_value } = parseDiscount(text);
          results.push({
            store,
            code,
            description: post.title,
            discount_type,
            discount_value,
            source_url: `https://www.reddit.com${post.permalink}`,
            source_site: SOURCE,
            expiry: null,
          });
        });
      });
    } catch (err) {
      console.error('scrapeReddit error', sub, err);
    }
  }
  return results;
}
