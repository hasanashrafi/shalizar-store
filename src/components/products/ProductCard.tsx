"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { calculateTierPrice } from "@/lib/pricing";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
      />
    </svg>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const wishlistIds = useWishlistStore((state) => state.wishlistIds);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  useEffect(() => {
    if (!useWishlistStore.persist.hasHydrated()) {
      void useWishlistStore.persist.rehydrate();
    }
  }, []);

  const prices = (product.tiers ?? [])
    .map((tier) => tier.pricePerKg)
    .filter((price) => Number.isFinite(price) && price > 0);
  const hasPrice = prices.length > 0;
  const minPrice = hasPrice ? Math.min(...prices) : 0;
  const maxPrice = hasPrice ? Math.max(...prices) : 0;
  const sortedTiers = [...(product.tiers ?? [])].sort((a, b) => a.minKg - b.minKg);
  const wholesaleFromKg = sortedTiers.length > 1 ? sortedTiers[1].minKg : 0;
  const isWishlisted = wishlistIds.includes(product.id);
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const stockInTons = (product.stockKg / 1000).toLocaleString("fa-IR", {
    maximumFractionDigits: 1,
  });
  const isOutOfStock = product.stockKg <= 0;
  const productHref = `/products/${product.slug}`;

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(t);
  }, [added]);

  const handleQuickAdd = () => {
    if (isOutOfStock || !hasPrice) return;
    const packageWeight = product.packageWeightKg || 30;
    const kg = Math.min(
      product.stockKg,
      Math.max(product.moqKg, packageWeight),
    );
    const unitPrice = calculateTierPrice(kg, product.tiers ?? []);
    const quantityBags = Math.max(1, Math.ceil(kg / packageWeight));
    addItem({
      productId: product.id,
      product,
      quantityBags,
      requestedKg: kg,
      totalKg: kg,
      unitPrice,
      totalPrice: kg * unitPrice,
    });
    setAdded(true);
  };

  return (
    <article
      dir="rtl"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E5E2] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#FAF8F5] to-stone-200 text-sm font-semibold text-stone-500">
            تصویر محصول
          </div>
        )}

        {/* بج‌های شیشه‌ای مبدأ و کالیبر */}
        <div className="absolute inset-x-3 top-3 z-10 flex flex-wrap gap-1.5 pl-14">
          <span className="rounded-lg border border-white/30 bg-stone-950/45 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
            {product.origin}
          </span>
          <span className="rounded-lg border border-white/30 bg-stone-950/45 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
            کالیبر {product.caliber}
          </span>
        </div>

        {/* دکمه علاقه‌مندی */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={
            isWishlisted
              ? `حذف ${product.title} از علاقه‌مندی‌ها`
              : `افزودن ${product.title} به علاقه‌مندی‌ها`
          }
          aria-pressed={isWishlisted}
          className={`absolute left-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition ${
            isWishlisted
              ? "border-rose-700 bg-rose-700 text-white"
              : "border-white/40 bg-white/85 text-stone-700 hover:bg-white hover:text-rose-700"
          }`}
        >
          <HeartIcon filled={isWishlisted} />
        </button>

        {/* بج موجودی */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-2">
          {isOutOfStock ? (
            <span className="rounded-full bg-stone-900/90 px-3 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-md">
              اتمام موجودی
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50/95 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-sm backdrop-blur-md">
              موجود در انبار
            </span>
          )}
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-stone-700 shadow-sm backdrop-blur-md">
            {stockInTons} تن
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <Link
            href={productHref}
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            <h3 className="mb-1.5 line-clamp-1 text-base font-extrabold text-[#1F2937] transition-colors group-hover:text-[#14532D] sm:text-lg">
              {product.title}
            </h3>
          </Link>

          <p className="mb-3 line-clamp-1 text-xs text-stone-500">
            {product.origin} — کالیبر {product.caliber}
          </p>

          {/* نوار وضعیت تخفیف عمده */}
          <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-amber-200/70 bg-amber-50 px-3 py-2">
            <span aria-hidden="true" className="text-sm">
              🏷️
            </span>
            <span className="text-[11px] font-bold text-amber-900">
              {wholesaleFromKg > 0
                ? `تخفیف عمده از ${wholesaleFromKg.toLocaleString("fa-IR")} کیلوگرم`
                : "قیمت پلکانی بر اساس تناژ"}
            </span>
            <span className="mr-auto text-[11px] font-medium text-amber-700">
              MOQ {product.moqKg.toLocaleString("fa-IR")} کیلو
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-[#E5E5E2] pt-4">
          <div>
            <span className="mb-1 block text-xs text-stone-500">
              قیمت هر کیلو
            </span>
            {hasPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-stone-400 line-through">
                  {maxPrice.toLocaleString("fa-IR")}
                </span>
                <span className="text-lg font-extrabold text-[#14532D]">
                  {minPrice.toLocaleString("fa-IR")}
                </span>
                <span className="text-[11px] font-medium text-stone-500">
                  تومان
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold text-stone-600">
                استعلام قیمت
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock || !hasPrice}
              className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:bg-stone-300 ${
                added
                  ? "bg-emerald-700"
                  : "bg-[#14532D] hover:-translate-y-0.5 hover:bg-[#0f3d22] hover:shadow-md"
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 4h2l2.4 12.3a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="21" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="18" cy="21" r="1.4" fill="currentColor" stroke="none" />
              </svg>
              {added ? "به سبد اضافه شد" : "انتخاب و خرید"}
            </button>
            <Link
              href={productHref}
              aria-label={`جزئیات ${product.title}`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E5E2] text-stone-600 transition hover:bg-stone-50"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4 rtl:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}