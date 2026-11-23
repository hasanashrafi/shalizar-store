import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import ProductCard from "@/components/products/ProductCard";
import ProductModel from "@/models/Product";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

const LEGUME_TYPES = [
  { key: "chickpea", label: "نخود", keyword: "نخود" },
  { key: "beans", label: "لوبیا", keyword: "لوبیا" },
  { key: "lentils", label: "عدس", keyword: "عدس" },
] as const;

type LegumeType = (typeof LEGUME_TYPES)[number]["key"];

interface CatalogFilters {
  type?: string;
  search?: string;
  sort?: string;
}

interface ProductsPageProps {
  searchParams: Promise<CatalogFilters>;
}

function isLegumeType(value: string | undefined): value is LegumeType {
  return LEGUME_TYPES.some((item) => item.key === value);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildCatalogHref(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  if (isLegumeType(filters.type)) {
    params.set("type", filters.type);
  }
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

async function getCatalogData(filters: CatalogFilters): Promise<{
  products: Product[];
}> {
  await connectToDatabase();

  const query = ProductModel.find();

  if (isLegumeType(filters.type)) {
    const type = LEGUME_TYPES.find((item) => item.key === filters.type);
    if (type) {
      query.where("title").regex(new RegExp(escapeRegex(type.keyword), "i"));
    }
  }

  const searchAlternatives: Array<Record<string, RegExp>> = [];
  if (filters.search?.trim()) {
    const term = new RegExp(escapeRegex(filters.search.trim()), "i");
    searchAlternatives.push({ title: term }, { caliber: term });
  }
  if (searchAlternatives.length > 0) {
    query.or(searchAlternatives);
  }

  query.sort(filters.sort === "moq" ? { moqKg: 1 } : { createdAt: -1 });

  const documents = await query.lean();

  // Convert to plain objects for client components
  const plainProducts = JSON.parse(JSON.stringify(documents)) as Array<{
    _id: { toString(): string };
    title: string;
    slug: string;
    origin: string;
    caliber: string;
    wastePercent: number | null;
    moisturePercent: number | null;
    packaging: string;
    packageWeightKg: number;
    moqKg: number;
    stockKg: number;
    imageUrl?: string;
    tiers: Array<{ minKg: number; maxKg: number | null; pricePerKg: number }>;
    createdAt: Date;
    updatedAt: Date;
  }>;

  const products: Product[] = plainProducts.map((product) => ({
    ...product,
    id: product._id.toString(),
    tiers: product.tiers.map((tier) => ({
      ...tier,
      maxKg: tier.maxKg ?? null,
    })),
  }));

  if (filters.sort === "cheapest" || filters.sort === "expensive") {
    const getPrice = (product: Product) => {
      const prices = product.tiers.map((tier) => tier.pricePerKg);
      if (prices.length === 0) {
        return filters.sort === "cheapest"
          ? Number.POSITIVE_INFINITY
          : Number.NEGATIVE_INFINITY;
      }
      return filters.sort === "cheapest"
        ? Math.min(...prices)
        : Math.max(...prices);
    };

    products.sort((left, right) =>
      filters.sort === "cheapest"
        ? getPrice(left) - getPrice(right)
        : getPrice(right) - getPrice(left),
    );
  }

  return { products };
}

export default async function ProductsCatalogPage({
  searchParams,
}: ProductsPageProps) {
  const filters = await searchParams;
  const { products } = await getCatalogData(filters);
  const currentType = isLegumeType(filters.type) ? filters.type : "all";
  const currentSort = filters.sort || "newest";
  const currentSearch = filters.search || "";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAF8F5] px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-stone-200 pb-7 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
              بازار عمده‌فروشی شالیزار
            </span>
            <h1 className="text-xl font-black tracking-tight text-stone-950 sm:text-3xl lg:text-4xl">
              کاتالوگ حبوبات عمده
            </h1>
            <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">
              محصولات را بر اساس نوع حبوبات فیلتر کنید و قیمت پلکانی، موجودی و
              حداقل سفارش هر محصول را ببینید. ارسال همه سفارش‌ها از مرند انجام
              می‌شود.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm shadow-sm">
            <span className="font-bold text-stone-900">
              {products.length.toLocaleString("fa-IR")}
            </span>
            <span className="mr-1.5 text-stone-500">محصول در این فهرست</span>
          </div>
        </header>

        <section
          aria-label="فیلتر محصولات"
          className="mb-8 space-y-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <form action="/products" method="get" className="flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="type" value={currentType} />
            <input type="hidden" name="sort" value={currentSort} />
            <label htmlFor="product-search" className="sr-only">
              جستجوی محصول یا کالیبر
            </label>
            <input
              id="product-search"
              type="search"
              name="search"
              defaultValue={currentSearch}
              placeholder="جستجو در نام محصول یا کالیبر..."
              className="min-h-11 flex-1 rounded-xl border border-stone-300 bg-stone-50 px-4 text-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-700/15"
            />
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-stone-900 px-6 text-sm font-bold text-white transition hover:bg-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
            >
              جستجو
            </button>
          </form>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="ml-1 text-xs font-bold text-stone-500">نوع حبوبات:</span>
              <Link
                href={buildCatalogHref({
                  type: "all",
                  search: currentSearch,
                  sort: currentSort,
                })}
                aria-pressed={currentType === "all"}
                className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                  currentType === "all"
                    ? "bg-amber-900 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                همه
              </Link>
              {LEGUME_TYPES.map((type) => (
                <Link
                  key={type.key}
                  href={buildCatalogHref({
                    type: currentType === type.key ? "all" : type.key,
                    search: currentSearch,
                    sort: currentSort,
                  })}
                  aria-pressed={currentType === type.key}
                  className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                    currentType === type.key
                      ? "bg-amber-900 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {type.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
            <span className="ml-1 text-xs font-bold text-stone-500">مرتب‌سازی:</span>
            {[
              { value: "newest", label: "جدیدترین" },
              { value: "cheapest", label: "ارزان‌ترین" },
              { value: "moq", label: "کمترین MOQ" },
            ].map((sort) => (
              <Link
                key={sort.value}
                href={buildCatalogHref({
                  type: currentType,
                  search: currentSearch,
                  sort: sort.value,
                })}
                aria-pressed={currentSort === sort.value}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  currentSort === sort.value
                    ? "bg-amber-100 text-amber-950"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {sort.label}
              </Link>
            ))}
          </div>
        </section>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center sm:px-6 sm:py-16">
            <p className="text-base font-bold text-stone-800">
              محصولی با این فیلترها پیدا نشد.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex text-sm font-bold text-amber-900 underline underline-offset-4"
            >
              پاک‌کردن فیلترها
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
