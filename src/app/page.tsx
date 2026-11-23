import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/products/ProductCard";
import QuickCalculator from "@/components/home/QuickCalculator";
import { connectToDatabase, getDbStatus } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import { Product } from "@/types";
import ArticleModel from "@/models/Article";
import DbOfflineBanner from "@/components/home/DbOfflineBanner";

export const dynamic = "force-dynamic";

interface CategoryItem {
  href: string;
  label: string;
  image: string;
}

const CATEGORIES: CategoryItem[] = [
  { href: "/products?type=beans", label: "لوبیا", image: "/images/categories/category1.png" },
  { href: "/products?type=chickpea", label: "نخود", image: "/images/categories/category2.png" },
  { href: "/products?type=lentils", label: "عدس", image: "/images/categories/category3.png" },
  { href: "/products", label: "همه محصولات", image: "/images/categories/category4.png" },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fallback-1",
    title: "لوبیا قرمز درجه یک",
    slug: "lobia-ghermiz",
    caliber: "۸-۹ میلی‌متر",
    origin: "ایران",
    packaging: "بسته ۵ کیلوگرمی",
    moqKg: 5,
    packageWeightKg: 5,
    stockKg: 500,
    wastePercent: 2,
    moisturePercent: 12,
    imageUrl: "/images/products/fallback-1.jpg",
    tiers: [
      { minKg: 5, maxKg: 25, pricePerKg: 45000 },
      { minKg: 25, maxKg: 100, pricePerKg: 42000 },
      { minKg: 100, maxKg: null, pricePerKg: 39000 },
    ],
  },
  {
    id: "fallback-2",
    title: "نخود خشک grado",
    slug: "nokhod-grado",
    caliber: "۸ میلی‌متر",
    origin: "ایران",
    packaging: "بسته ۵ کیلوگرمی",
    moqKg: 5,
    packageWeightKg: 5,
    stockKg: 300,
    wastePercent: 1,
    moisturePercent: 10,
    imageUrl: "/images/products/fallback-2.jpg",
    tiers: [
      { minKg: 5, maxKg: 25, pricePerKg: 55000 },
      { minKg: 25, maxKg: 100, pricePerKg: 52000 },
      { minKg: 100, maxKg: null, pricePerKg: 49000 },
    ],
  },
];

const FALLBACK_ARTICLES: FallbackArticle[] = [
  {
    id: "fallback-article-1",
    title: "چگونه کالیبر برنج را تشخیص دهیم؟",
    slug: "caliber-rice",
    excerpt: "راهنمای کامل برای شناسایی کالیبر دانه برنج قبل از خرید عمده.",
    coverImage: "/images/blogs/blog-1.png",
    author: "بازرگانی شالیزار",
    category: "مقاله",
    publishedAt: "2026-01-01T00:00:00.000Z",
  },
];

async function getFeaturedProducts(): Promise<{ products: Product[]; dbConnected: boolean }> {
  const status = getDbStatus();
  if (!status.connected) {
    return { products: FALLBACK_PRODUCTS, dbConnected: false };
  }
  try {
    await connectToDatabase();
    const products = await ProductModel.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return {
      products: products.map((product) => ({
        id: product._id.toString(),
        title: product.title,
        slug: product.slug,
        caliber: product.caliber,
        origin: product.origin,
        packaging: product.packaging,
        moqKg: product.moqKg,
        packageWeightKg: product.packageWeightKg,
        stockKg: product.stockKg,
        wastePercent: product.wastePercent ?? null,
        moisturePercent: product.moisturePercent ?? null,
        imageUrl: product.imageUrl ?? null,
        tiers: product.tiers.map((tier) => ({
          minKg: tier.minKg,
          maxKg: tier.maxKg ?? null,
          pricePerKg: tier.pricePerKg,
        })),
      })),
      dbConnected: true,
    };
  } catch {
    return { products: FALLBACK_PRODUCTS, dbConnected: false };
  }
}

interface FallbackArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  author: string;
  category: string;
  publishedAt: string;
}

async function getFeaturedArticles(): Promise<{ articles: FallbackArticle[]; dbConnected: boolean }> {
  const status = getDbStatus();
  if (!status.connected) {
    return { articles: FALLBACK_ARTICLES, dbConnected: false };
  }
  try {
    await connectToDatabase();
    const articles = await ArticleModel.find({ isPublished: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(3)
      .lean();

    return {
      articles: articles.map((a) => ({
        id: a._id.toString(),
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        coverImage: a.coverImage ?? "/images/blogs/blog-1.png",
        author: a.author ?? "بازرگانی شالیزار",
        category: a.category ?? "مقاله",
        publishedAt: (a.publishedAt ?? a.createdAt).toISOString(),
      })),
      dbConnected: true,
    };
  } catch {
    return { articles: FALLBACK_ARTICLES, dbConnected: false };
  }
}

export default async function Home() {
  const dbStatus = getDbStatus();
  const [featuredProductsResult, featuredArticlesResult] = await Promise.all([
    getFeaturedProducts(),
    getFeaturedArticles(),
  ]);

  const featuredProducts = featuredProductsResult.products;
  const featuredArticles = featuredArticlesResult.articles;
  const dbConnected =
    featuredProductsResult.dbConnected && featuredArticlesResult.dbConnected;

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#1F2937] transition-colors duration-300 dark:bg-[#0b1120] dark:text-stone-100">
      {!dbConnected && dbStatus.error && <DbOfflineBanner message={dbStatus.error} />}
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Hero نامتقارن */}
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-[#E5E5E2]/70 bg-gradient-to-l from-[#FAF8F5] to-[#E5E5E2]/40 shadow-sm sm:mt-8">
          <div className="grid items-center gap-6 p-5 sm:gap-8 sm:p-8 lg:grid-cols-2 lg:p-12">
            {/* متن (راست) */}
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14532D]/10 px-3 py-1 text-[11px] font-bold text-[#14532D] sm:text-xs">
                <span aria-hidden="true">🌾</span>
                خرید بی‌واسطه از انبار
              </span>
              <h1 className="mt-3 text-2xl font-extrabold leading-tight text-[#1F2937] sm:mt-4 sm:text-4xl lg:text-5xl">
                خرید بی‌واسطه و عمده انواع برنج و حبوبات
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600 sm:mt-4 sm:text-base sm:leading-8">
                تضمین کیفیت و بهترین قیمت بازار برای خرید عمده و خرده
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-7">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-[#D97706] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-700 sm:px-8 sm:py-3.5 sm:text-base"
                >
                  مشاهده محصولات
                </Link>
                <Link
                  href="#quick-calc"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#14532D]/20 bg-white px-5 py-3 text-sm font-bold text-[#14532D] transition-all hover:border-[#14532D]/40 hover:bg-[#14532D]/5 sm:px-6 sm:py-3.5"
                >
                  محاسبه قیمت عمده
                </Link>
              </div>
            </div>

            {/* تصویر (چپ) */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#E5E5E2] bg-[#FAF8F5] lg:aspect-auto lg:h-full lg:min-h-[340px]">
              <Image
                src="/images/hero.jpg"
                alt="کیسه‌های برنج و حبوبات شالیزار"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </section>

        {/* محاسبه‌گر سریع قیمت عمده */}
        <QuickCalculator />

        {/* دسته‌بندی‌های سریع */}
        <section className="mt-10 sm:mt-14 lg:mt-16">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-black text-[#1F2937] sm:text-xl lg:text-2xl">
                دسته‌بندی‌های سریع
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                نوع حبوبات مورد نظر خود را انتخاب کنید
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-[#E5E5E2] bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-amber-200 hover:shadow-md"
              >
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span className="block text-base font-bold text-white sm:text-lg">
                    {cat.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* محصولات پیشنهادی */}
        <section className="mt-10 sm:mt-14 lg:mt-16">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-black text-[#1F2937] sm:text-xl lg:text-2xl">
                ویترین محصولات شالیزار
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#D97706]">
                تضمین کیفیت و قیمت عمده با کالیبر تضمینی
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 transition hover:text-amber-800"
            >
              مشاهده همه
              <span aria-hidden="true">←</span>
            </Link>
          </div>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {[
              { label: "همه محصولات", href: "/products" },
              { label: "برنج", href: "/products?type=rice" },
              { label: "عدس", href: "/products?type=lentils" },
              { label: "لوبیا", href: "/products?type=beans" },
              { label: "نخود", href: "/products?type=chickpea" },
            ].map((chip, index) => (
              <Link
                key={chip.href}
                href={chip.href}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                  index === 0
                    ? "border-[#14532D] bg-[#14532D] text-white"
                    : "border-[#E5E5E2] bg-white text-stone-600 hover:border-amber-300 hover:text-amber-700"
                }`}
              >
                {chip.label}
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-[#E5E5E2] bg-white px-4 py-10 text-center sm:py-16">
                <p className="text-stone-500">محصولی ثبت نشده است.</p>
              </div>
            )}
          </div>
        </section>

        {/* درباره */}
        <section
          id="about"
          className="mt-10 mb-4 rounded-3xl border border-[#E5E5E2] bg-white p-5 shadow-sm sm:mt-14 sm:p-8 lg:mt-16 lg:p-10"
        >
          <div className="grid items-center gap-6 sm:gap-10 md:grid-cols-2">
            <div>
              <span className="mb-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900">
                درباره شالیزار
              </span>
              <h2 className="mb-3 text-lg font-black text-[#1F2937] sm:mb-4 sm:text-xl lg:text-2xl">
                بازرگانی حبوبات با شفافیت کامل
              </h2>
              <p className="mb-6 leading-8 text-stone-600">
                شالیزار مرجع استعلام قیمت و خرید مستقیم انواع حبوبات با کالیبر
                تضمینی است. با کیفیت، بسته‌بندی و قیمت‌گذاری شفاف، خرید عمده را
                ساده و مطمئن می‌سازیم.
              </p>
              <ul className="space-y-3 text-sm text-stone-600">
                {[
                  "کالیبر تضمینی دانه",
                  "قیمت پلکانی بر اساس تناژ",
                  "موجودی انبار به‌روز",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-900">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-60 overflow-hidden rounded-2xl border border-[#E5E5E2] shadow-sm sm:h-72">
              <Image
                src="/images/background/coffe-bg.jpg"
                alt="درباره شالیزار"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
          </div>
        </section>

        {/* مقالات */}
        {featuredArticles.length > 0 && (
          <section className="mt-10 sm:mt-14 lg:mt-16">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-lg font-black text-[#1F2937] sm:text-xl lg:text-2xl">
                  مقالات و اخبار
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  نوشته‌های آموزشی و راهنمای خرید
                </p>
              </div>
              <Link
                href="/articles"
                className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 transition hover:text-amber-800"
              >
                مشاهده همه
                <span aria-hidden="true">←</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {featuredArticles.map((article) => (
                <article
                  key={article.id}
                  className="group overflow-hidden rounded-2xl border border-[#E5E5E2] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <span className="absolute right-3 top-3 rounded-lg bg-rose-700 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="mb-2 line-clamp-2 text-base font-extrabold text-[#1F2937] transition-colors group-hover:text-emerald-900">
                      <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="mb-4 line-clamp-3 text-sm text-stone-600">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span aria-hidden="true">📅</span>
                      <span>
                        {new Intl.DateTimeFormat("fa-IR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }).format(new Date(article.publishedAt))}
                      </span>
                      <span className="h-3 w-px bg-stone-300" />
                      <span>{article.author}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}