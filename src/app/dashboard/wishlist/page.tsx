"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import { useWishlistStore } from "@/store/useWishlistStore";
import type { Product } from "@/types";

export default function CustomerWishlistPage() {
  const wishlistIds = useWishlistStore((state) => state.wishlistIds);
  const wishlistIdsKey = wishlistIds.join(",");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadWishlist = async () => {
      try {
        if (!useWishlistStore.persist.hasHydrated()) {
          await useWishlistStore.persist.rehydrate();
        }
        if (controller.signal.aborted) return;

        const ids = useWishlistStore.getState().wishlistIds;
        if (ids.length === 0) {
          setProducts([]);
          setError(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ ids: ids.join(",") });
        const response = await fetch(`/api/products?${params}`, {
          signal: controller.signal,
        });
        const data: unknown = await response.json();

        if (!response.ok) {
          const message =
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string"
              ? data.error
              : "بارگیری علاقه‌مندی‌ها انجام نشد.";
          throw new Error(message);
        }

        if (
          typeof data !== "object" ||
          data === null ||
          !("products" in data) ||
          !Array.isArray(data.products)
        ) {
          throw new Error("پاسخ سرور برای علاقه‌مندی‌ها معتبر نیست.");
        }

        const orderedProducts = new Map<string, Product>(
          (data.products as Product[]).map((product) => [product.id, product]),
        );
        setProducts(
          ids
            .map((id) => orderedProducts.get(id))
            .filter((product): product is Product => product !== undefined),
        );
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "بارگیری علاقه‌مندی‌ها انجام نشد.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadWishlist();
    return () => controller.abort();
  }, [wishlistIdsKey]);

  return (
    <main dir="rtl" className="rounded-3xl border border-[#E7E5E4] bg-white p-6 shadow-sm sm:p-9">
      <header className="mb-7">
        <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
          فهرست شخصی
        </span>
            <h1 className="mt-3 text-xl font-black text-[#1C1917] sm:text-2xl">
          محصولات نشان‌شده
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          بارهایی که برای بررسی و استعلام بعدی ذخیره کرده‌اید.
        </p>
      </header>

      {loading ? (
        <div role="status" className="rounded-2xl bg-[#FAF8F5] p-6 text-center text-sm text-stone-500 sm:p-10">
          در حال بارگیری علاقه‌مندی‌ها...
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          {error}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-[#E7E5E4] bg-[#FAF8F5] px-4 py-10 text-center sm:px-5 sm:py-12">
          <span
            aria-hidden="true"
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-2xl text-rose-700 sm:h-14 sm:w-14 sm:text-3xl"
          >
            ♡
          </span>
          <h2 className="mt-4 font-extrabold text-[#1C1917]">
            هنوز محصولی نشان نکرده‌اید
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
            در کاتالوگ، روی قلب کارت محصول بزنید تا آن را برای بررسی بعدی در این
            فهرست ذخیره کنید.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-600 px-5 text-sm font-bold text-white transition hover:bg-amber-700"
          >
            بازگشت به کاتالوگ
          </Link>
        </section>
      )}
    </main>
  );
}