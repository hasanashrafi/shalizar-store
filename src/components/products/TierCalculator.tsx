"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { calculateTierPrice } from "@/lib/pricing";
import { useCartStore } from "@/store/useCartStore";
import type { Product } from "@/types";

interface TierCalculatorProps {
  product: Product;
}

type WeightUnit = "kg" | "ton";

const formatNumber = (value: number, maximumFractionDigits = 0) =>
  value.toLocaleString("fa-IR", { maximumFractionDigits });

export default function TierCalculator({ product }: TierCalculatorProps) {
  const packageWeightKg = product.packageWeightKg;
  const minBags = Math.ceil(product.moqKg / packageWeightKg);
  const maxBags = Math.floor(product.stockKg / packageWeightKg);
  const minOrderKg = minBags * packageWeightKg;
  const sortedTiers = useMemo(
    () => [...product.tiers].sort((a, b) => a.minKg - b.minKg),
    [product.tiers],
  );
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [requestedKg, setRequestedKg] = useState(minOrderKg);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const bagsCount =
    requestedKg > 0 ? Math.ceil(requestedKg / packageWeightKg) : 0;
  const totalKg = requestedKg > 0 ? requestedKg : 0;
  const hasTiers = sortedTiers.length > 0;
  const unitPrice = hasTiers
    ? calculateTierPrice(totalKg, sortedTiers)
    : 0;
  const totalPrice = totalKg * unitPrice;
  const activeTierIndex = sortedTiers.findIndex(
    (tier) =>
      totalKg >= tier.minKg &&
      (tier.maxKg == null || totalKg <= tier.maxKg),
  );
  const exceedsStock = totalKg > product.stockKg;
  const belowMinimum = totalKg < product.moqKg;
  const inventoryCannotMeetMinimum = maxBags < minBags;
  const canAdd =
    hasTiers &&
    bagsCount > 0 &&
    !belowMinimum &&
    !exceedsStock &&
    !inventoryCannotMeetMinimum;
  const nextTier =
    activeTierIndex >= 0 ? sortedTiers[activeTierIndex + 1] : sortedTiers[0];
  const bagsToNextTier =
    nextTier && totalKg < nextTier.minKg
      ? Math.ceil((nextTier.minKg - totalKg) / packageWeightKg)
      : 0;
  const baseTierPrice = sortedTiers.length > 0 ? sortedTiers[0].pricePerKg : 0;
  const savingsPercent =
    baseTierPrice > 0 && unitPrice > 0
      ? Math.max(0, Math.round((1 - unitPrice / baseTierPrice) * 100))
      : 0;
  const baseValue = totalKg * baseTierPrice;
  const discountValue = Math.max(0, baseValue - totalPrice);
  const freightEstimate = totalKg >= 1000 ? 1_500_000 : totalKg >= 500 ? 800_000 : 350_000;

  useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [added]);

  const handleWeightChange = (value: string) => {
    if (value === "") {
      setRequestedKg(0);
      return;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    setRequestedKg(weightUnit === "ton" ? parsed * 1000 : parsed);
  };

  const addToQuote = () => {
    if (!canAdd) return;

    addItem({
      productId: product.id,
      product,
      quantityBags: bagsCount,
      requestedKg: totalKg,
      totalKg,
      unitPrice,
      totalPrice,
    });
    setAdded(true);
  };

  const stepBags = (delta: number) => {
    const nextBags = Math.max(1, bagsCount + delta);
    const nextKg = nextBags * packageWeightKg;
    if (nextKg > product.stockKg) return;
    setRequestedKg(nextKg);
  };

  return (
    <section className="sticky top-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-xl sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900">
            محاسبه‌گر قیمت عمده
          </h2>
          <p className="mt-1 text-sm text-stone-500">{product.title}</p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900">
          حداقل {formatNumber(product.moqKg)} کیلو
        </span>
      </div>

      <div className="mb-5 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor="requested-weight"
            className="text-sm font-bold text-stone-800"
          >
            مقدار موردنظر
          </label>
          <div
            className="flex rounded-lg border border-stone-200 bg-white p-1 text-xs"
            aria-label="واحد وزن"
          >
            <button
              type="button"
              onClick={() => setWeightUnit("kg")}
              aria-pressed={weightUnit === "kg"}
              className={`rounded-md px-3 py-1.5 font-semibold ${
                weightUnit === "kg"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600"
              }`}
            >
              کیلوگرم
            </button>
            <button
              type="button"
              onClick={() => setWeightUnit("ton")}
              aria-pressed={weightUnit === "ton"}
              className={`rounded-md px-3 py-1.5 font-semibold ${
                weightUnit === "ton"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600"
              }`}
            >
              تن
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            id="requested-weight"
            type="number"
            min={weightUnit === "ton" ? product.moqKg / 1000 : product.moqKg}
            max={weightUnit === "ton" ? product.stockKg / 1000 : product.stockKg}
            step={weightUnit === "ton" ? 0.001 : 1}
            value={
              requestedKg === 0
                ? ""
                : weightUnit === "ton"
                  ? requestedKg / 1000
                  : requestedKg
            }
            onChange={(event) => handleWeightChange(event.target.value)}
            inputMode="decimal"
            className="h-12 w-full rounded-xl border border-stone-300 bg-white px-4 pl-20 text-lg font-bold text-stone-900 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
            aria-describedby="weight-hint"
          />
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-stone-500">
            {weightUnit === "ton" ? "تن" : "کیلوگرم"}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-xs text-stone-500">
            هر کیسه {formatNumber(packageWeightKg)} کیلوگرم
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => stepBags(-1)}
              disabled={bagsCount <= 1}
              aria-label="کاهش تعداد کیسه"
              className="h-9 w-9 rounded-lg border border-stone-300 text-lg font-bold text-stone-700 transition hover:bg-stone-100 disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-16 text-center text-sm font-bold text-stone-800">
              {formatNumber(bagsCount)} کیسه
            </span>
            <button
              type="button"
              onClick={() => stepBags(1)}
              aria-label="افزایش تعداد کیسه"
              className="h-9 w-9 rounded-lg border border-stone-300 text-lg font-bold text-stone-700 transition hover:bg-stone-100"
            >
              +
            </button>
          </div>
        </div>
        <p id="weight-hint" className="mt-2 text-xs leading-5 text-stone-500">
          می‌توانید مقدار را دقیقاً به کیلوگرم وارد کنید یا با دکمه‌های +/− تعداد
          کیسه را تغییر دهید.
        </p>

        {maxBags >= minBags && (
          <input
            type="range"
            min={minBags}
            max={maxBags}
            step={1}
            value={Math.min(maxBags, Math.max(minBags, bagsCount || minBags))}
            onChange={(event) =>
              setRequestedKg(Number(event.target.value) * packageWeightKg)
            }
            aria-label="انتخاب تعداد کیسه"
            className="mt-4 h-2 w-full cursor-pointer accent-[#14532D]"
          />
        )}

        {/* نقاط شکست تناژ */}
        {hasTiers && (
          <div className="mt-4 flex flex-wrap gap-2">
            {sortedTiers.map((tier) => {
              const isTierActive =
                totalKg >= tier.minKg &&
                (tier.maxKg == null || totalKg <= tier.maxKg);
              return (
                <button
                  key={`bp-${tier.minKg}`}
                  type="button"
                  onClick={() =>
                    setRequestedKg(Math.min(product.stockKg, tier.minKg))
                  }
                  aria-pressed={isTierActive}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                    isTierActive
                      ? "bg-[#14532D] text-white shadow-sm"
                      : "bg-[#FAF8F5] text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {formatNumber(tier.minKg)} کیلو
                </button>
              );
            })}
          </div>
        )}

        {savingsPercent > 0 && (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
            ٪{formatNumber(savingsPercent)} تخفیف عمده فعال شد!
          </p>
        )}

        <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-stone-600">
          <span>
            تعداد کیسه:{" "}
            <strong className="text-stone-900">{formatNumber(bagsCount)}</strong>
          </span>
          <span>
            وزن سفارش:{" "}
            <strong className="text-stone-900">
              {formatNumber(totalKg)} کیلوگرم
              {totalKg > 0 && ` (${formatNumber(totalKg / 1000, 3)} تن)`}
            </strong>
          </span>
        </div>
      </div>

      {inventoryCannotMeetMinimum ? (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          موجودی فعلی برای تأمین حداقل سفارش کافی نیست.
        </p>
      ) : belowMinimum ? (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          وزن سفارش نباید از حداقل {formatNumber(product.moqKg)} کیلوگرم کمتر باشد.
        </p>
      ) : exceedsStock ? (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          این مقدار از موجودی {formatNumber(product.stockKg)} کیلوگرمی بیشتر است.
        </p>
      ) : !hasTiers ? (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          برای این محصول هنوز پلکان قیمت ثبت نشده است.
        </p>
      ) : null}

      {bagsToNextTier > 0 && nextTier && (
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
          با افزودن{" "}
          <strong>{formatNumber(bagsToNextTier)} کیسه</strong> دیگر، به پلکان
          بعدی قیمت {formatNumber(nextTier.pricePerKg)} تومان برای هر کیلو می‌رسید.
        </p>
      )}

      <div className="mb-5 overflow-hidden rounded-2xl border border-stone-200">
        <div className="border-b border-stone-200 bg-stone-50 px-4 py-3">
          <h3 className="text-sm font-bold text-stone-800">پلکان قیمت عمده</h3>
        </div>
        {hasTiers ? (
          <ul className="divide-y divide-stone-100">
            {sortedTiers.map((tier, index) => {
              const isActive = index === activeTierIndex;
              return (
                <li
                  key={`${tier.minKg}-${tier.maxKg ?? "plus"}-${index}`}
                  className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${
                    isActive ? "bg-amber-50 font-bold text-amber-950" : ""
                  }`}
                >
                  <span>
                    {formatNumber(tier.minKg)} تا{" "}
                    {tier.maxKg == null ? "بالاتر" : formatNumber(tier.maxKg)} کیلو
                    {isActive && (
                      <span className="mr-2 text-xs text-emerald-700">
                        نرخ انتخابی
                      </span>
                    )}
                  </span>
                  <span className="shrink-0">
                    {formatNumber(tier.pricePerKg)} تومان/کیلو
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-4 py-3 text-sm text-stone-500">قیمتی ثبت نشده است.</p>
        )}
      </div>

      <div className="mb-5 space-y-3 rounded-2xl border border-[#E5E5E2] bg-[#FAF8F5] p-5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-stone-600">وزن سفارش</span>
          <span className="font-bold text-stone-900">
            {formatNumber(totalKg)} کیلوگرم
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-stone-600">ارزش پایه (هر کیلو {formatNumber(baseTierPrice)} تومان)</span>
          <span className="font-bold text-stone-900">
            {formatNumber(baseValue)} تومان
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-stone-600">تخفیف پلکانی</span>
          <span className="font-bold text-emerald-700">
            {discountValue > 0 ? `− ${formatNumber(discountValue)} تومان` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-stone-600">برآورد ارسال (باربری)</span>
          <span className="font-semibold text-stone-800">
            {formatNumber(freightEstimate)} تومان
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[#E5E5E2] pt-3">
          <span className="text-sm font-bold text-[#14532D]">
            جمع نهایی تقریبی
          </span>
          <span className="text-lg font-extrabold text-[#14532D]">
            {formatNumber(totalPrice)} تومان
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={addToQuote}
        disabled={!canAdd}
        className={`w-full rounded-full py-4 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:bg-stone-300 ${
          added
            ? "bg-emerald-700"
            : "bg-[#14532D] hover:bg-[#0f3d22] disabled:hover:bg-stone-300"
        }`}
      >
        {added ? "به پیش‌فاکتور اضافه شد" : "افزودن و نهایی‌سازی سفارش عمده"}
      </button>
      <Link
        href="/cart"
        className="mt-3 block text-center text-sm font-bold text-amber-800 hover:text-amber-950"
      >
        مشاهده پیش‌فاکتور
      </Link>
    </section>
  );
}
