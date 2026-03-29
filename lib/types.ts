export interface Coupon {
  id: number;
  store: "shein" | "asos" | "terminalx";
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: string | null;
  expiry: string | null;
  source_url: string | null;
  source_site: string | null;
  first_seen: number;
  last_verified: number;
  works_count: number;
  fails_count: number;
  is_active: number;
}
