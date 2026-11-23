"use client";

import Link from "next/link";
import { useState } from "react";

const WEIGHTS = [
  { label: "۵۰ کیلو", kg: 50, discount: 10 },
  { label: "۱۰۰ کیلو", kg: 100, discount: 15 },
  { label: "۵۰۰ کیلو", kg: 500, discount: 20 },
  { label: "۱ تن", kg: 1000, discount: 25 },
  { label: "۵ تن+", kg: 5000, discount: 30 },
] as const;

export default function QuickCalculator() {
  const [active, setActive] = useState(2);
  const selected = WEIGHTS[active];

  return (
    <div
      id="quick-calc"
      className="relative z-10 mx-auto mt-6 max-w-5xl scroll-mt-28 px-4 sm:-mt-12 sm:px-6"
    >
      <div className="rounded-2xl border border-[#E5E5E2]/80 bg-white p-5 shadow-lg shadow-[#14532D]/5 sm:p-6">
        <div className="flex flex-col items-stretch justify-between gap-4 sm:gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-900 sm:size-11">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18M7 7l5-4 5 4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-black text-[#1F2937] sm:text-base">
                محاسبه‌گر سریع قیمت عمده
              </p>
              <p className="mt-0.5 text-[11px] text-stone-500 sm:text-xs">
                تخفیف پلکانی بر اساس وزن سفارش
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {WEIGHTS.map((weight, index) => {
              const isActive = index === active;
              return (
                <button
                  key={weight.kg}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={isActive}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#14532D] text-white shadow-sm"
                      : "bg-[#FAF8F5] text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {weight.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
            <div className="text-center">
              <span className="block text-[11px] text-stone-500">تخفیف فعال</span>
              <span className="text-base font-black text-amber-600 sm:text-lg">
                ٪{selected.discount.toLocaleString("fa-IR")}
              </span>
            </div>
            <Link
              href="/products?discount=true"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-amber-600 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-700 hover:-translate-y-0.5 sm:px-6"
            >
              ثبت سفارش این وزن
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}