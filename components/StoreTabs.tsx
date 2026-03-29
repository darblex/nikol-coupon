"use client";

import clsx from "clsx";
import { useMemo } from "react";

type Store = "all" | "shein" | "asos" | "terminalx";

type Props = {
  active: Store;
  onChange: (store: Store) => void;
};

const tabs: { id: Store; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "shein", label: "Shein" },
  { id: "asos", label: "ASOS" },
  { id: "terminalx", label: "TerminalX" },
];

export function StoreTabs({ active, onChange }: Props) {
  const indicatorStyle = useMemo(() => {
    const index = tabs.findIndex((t) => t.id === active);
    if (index === -1) return {};
    return { left: `${index * 25}%` };
  }, [active]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div
        className="absolute inset-y-0 w-1/4 rounded-2xl bg-gray-100 transition-all duration-200"
        style={indicatorStyle}
      />
      <div className="relative grid grid-cols-4 text-sm font-semibold text-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "px-4 py-3 text-center transition-colors", 
              active === tab.id ? "text-gray-900" : "text-gray-500"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { Store };
