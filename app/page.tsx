"use client"; // v1.1

import { useEffect, useMemo, useState } from "react";
import { Coupon } from "@/lib/types";
import { CouponCard } from "@/components/CouponCard";
import { StoreTabs, Store } from "@/components/StoreTabs";

const stores: { id: Store; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "shein", label: "Shein" },
  { id: "asos", label: "ASOS" },
  { id: "terminalx", label: "TerminalX" },
];

export default function Home() {
  const [activeStore, setActiveStore] = useState<Store>("all");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = activeStore === "all" ? "" : `?store=${activeStore}`;
        const res = await fetch(`/api/coupons${query}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        const rawCoupons: Coupon[] = Array.isArray(data) ? data : (data.coupons ?? []);
        const sorted = rawCoupons.sort((a, b) => {
          if (b.last_verified !== a.last_verified) return b.last_verified - a.last_verified;
          return (b.works_count ?? 0) - (a.works_count ?? 0);
        });
        setCoupons(sorted);
      } catch (err) {
        console.error(err);
        setError("לא הצלחנו לטעון קופונים, נסה שוב");
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [activeStore]);

  const filteredCoupons = useMemo(() => {
    if (activeStore === "all") return coupons;
    return coupons.filter((c) => c.store === activeStore);
  }, [coupons, activeStore]);

  const handleVote = async (id: number, vote: "up" | "down") => {
    try {
      await fetch(`/api/coupons/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });

      setCoupons((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          return {
            ...c,
            works_count: c.works_count + (vote === "up" ? 1 : 0),
            fails_count: c.fails_count + (vote === "down" ? 1 : 0),
          };
        })
      );
      setToast("תודה! הצבעתך נרשמה");
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      console.error(err);
      setToast("שגיאה בשליחת ההצבעה");
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-12 sm:px-8">
        <header className="flex flex-col gap-3 text-center sm:text-left">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
                Nikol Coupon 🏷️
              </h1>
              <p className="text-lg font-semibold text-gray-700">
                קופונים עובדים לשיין, ASOS וTerminalX
              </p>
              <p className="text-sm font-semibold text-emerald-700">🌍 מקורות בינלאומיים + ישראליים</p>
            </div>
          </div>
          <StoreTabs active={activeStore} onChange={setActiveStore} />
        </header>

        <main>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 h-4 w-1/3 rounded bg-gray-200" />
                  <div className="mb-2 h-10 w-full rounded bg-gray-100" />
                  <div className="mb-2 h-3 w-2/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                  <div className="mt-6 flex gap-2">
                    <div className="h-10 w-full rounded bg-gray-200" />
                    <div className="h-10 w-full rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
              {error}
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-700">
              אין קופונים כרגע לחנות זו, חזור מחר
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} onVote={handleVote} />
              ))}
            </div>
          )}
        </main>

        <footer className="text-center text-sm text-gray-600">
          Nikol Coupon © 2026 | מתעדכן כל 6 שעות | קופונים מהמקורות הטובים ביותר
        </footer>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

