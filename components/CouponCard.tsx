"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Coupon } from "@/lib/types";

const storeStyles: Record<Coupon["store"], { color: string; name: string; bg: string }> = {
  shein: { color: "#e91e8c", name: "Shein", bg: "bg-shein/10" },
  asos: { color: "#2d2d2d", name: "ASOS", bg: "bg-asos/10" },
  terminalx: { color: "#ff6b35", name: "TerminalX", bg: "bg-terminalx/10" },
};

type Vote = "up" | "down";

type Props = {
  coupon: Coupon;
  onVote: (id: number, vote: Vote) => Promise<void>;
};

export function CouponCard({ coupon, onVote }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 3000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleReveal = async () => {
    setRevealed(true);
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleVote = async (vote: Vote) => {
    setIsVoting(true);
    try {
      await onVote(coupon.id, vote);
    } finally {
      setIsVoting(false);
    }
  };

  const verifiedLabel = useMemo(() => {
    const now = Date.now();
    const verifiedAt = coupon.last_verified * 1000;
    const diffHours = (now - verifiedAt) / (1000 * 60 * 60);

    if (diffHours <= 24) return { label: "אומת לפני פחות מ-24 שעות", tone: "green" as const };
    if (diffHours <= 24 * 7) {
      const days = Math.max(1, Math.floor(diffHours / 24));
      return { label: `אומת לפני ${days} ימים`, tone: "yellow" as const };
    }
    return { label: "לא אומת לאחרונה", tone: "gray" as const };
  }, [coupon.last_verified]);

  const successIndicator = useMemo(() => {
    if (coupon.works_count > 0 && coupon.works_count >= coupon.fails_count) {
      return `✅ ${coupon.works_count} אנשים אישרו`;
    }
    if (coupon.fails_count > coupon.works_count) {
      return "⚠️ לא עבד לאחרונה";
    }
    return "🆕 חדש";
  }, [coupon.works_count, coupon.fails_count]);

  const trustRatio = useMemo(() => {
    const total = coupon.works_count + coupon.fails_count;
    if (total === 0) return 50;
    return Math.round((coupon.works_count / total) * 100);
  }, [coupon.works_count, coupon.fails_count]);

  const { color, name } = storeStyles[coupon.store];

  return (
    <div className="group relative flex h-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {coupon.source_site ? (
        <span className="absolute right-3 top-3 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          {coupon.source_site}
        </span>
      ) : null}

      <div className="flex items-center gap-3">
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          {name}
        </span>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-semibold",
            verifiedLabel.tone === "green" && "bg-emerald-50 text-emerald-700",
            verifiedLabel.tone === "yellow" && "bg-amber-50 text-amber-700",
            verifiedLabel.tone === "gray" && "bg-gray-100 text-gray-600"
          )}
        >
          {verifiedLabel.label}
        </span>
        <span className="ml-auto text-sm text-gray-600">{successIndicator}</span>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleReveal}
          className="flex w-full items-center justify-between rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 font-mono text-lg tracking-widest transition hover:border-gray-300"
        >
          <span className={clsx("blur-sm transition", revealed && "blur-0 text-gray-900")}> 
            {revealed ? coupon.code : "••••••••"}
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {copied ? "✅ הועתק!" : "לחץ להעתיק"}
          </span>
        </button>
        {coupon.description ? (
          <p className="text-sm text-gray-700">{coupon.description}</p>
        ) : null}
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="rounded-full bg-gray-100 px-3 py-1">{coupon.discount_type}</span>
          {coupon.discount_value ? (
            <span className="rounded-full bg-gray-100 px-3 py-1">{coupon.discount_value}</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-2 rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${trustRatio}%` }}
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="font-semibold text-emerald-700">{coupon.works_count} עבד</span>
          <span className="font-semibold text-rose-700">{coupon.fails_count} לא עבד</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleVote("up")}
            disabled={isVoting}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
          >
            ✅ עבד לי
          </button>
          <button
            onClick={() => handleVote("down")}
            disabled={isVoting}
            className="flex-1 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-60"
          >
            ❌ לא עבד
          </button>
        </div>
      </div>
    </div>
  );
}
