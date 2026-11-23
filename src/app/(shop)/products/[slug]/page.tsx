import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import TierCalculator from "@/components/products/TierCalculator";
import ViewTracker from "@/components/products/ViewTracker";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getProductBySlug(slug: string): Promise<Product | null> {
  await connectToDatabase();
  const product = await ProductModel.findOne({ slug }).lean();

  if (!product) return null;

  return {
    id: product._id.toString(),
    title: product.title,
    slug: product.slug,
    origin: product.origin,
    caliber: product.caliber,
    wastePercent: product.wastePercent ?? null,
    moisturePercent: product.moisturePercent ?? null,
    packaging: product.packaging,
    packageWeightKg: product.packageWeightKg,
    moqKg: product.moqKg,
    stockKg: product.stockKg,
    imageUrl: product.imageUrl ?? null,
    tiers: product.tiers.map((tier) => ({
      minKg: tier.minKg,
      maxKg: tier.maxKg ?? null,
      pricePerKg: tier.pricePerKg,
    })),
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const stockInTons = (product.stockKg / 1000).toFixed(1);

  return (
      <div className="min-h-screen bg-[#FAF8F5] py-6 px-4 sm:px-6 sm:py-10 lg:px-8">
      <ViewTracker productId={product.id} />
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-stone-500 mb-8">
          <Link href="/" className="hover:text-amber-700 transition-colors">
            صفحه اصلی
          </Link>
          <span>/</span>
          <Link
            href="/products"
            className="hover:text-amber-700 transition-colors"
          >
            کاتالوگ محصولات
          </Link>
          <span>/</span>
          <span className="text-[#1C1917] font-semibold">{product.title}</span>
        </nav>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start sm:gap-8">
          {/* Right Column: Gallery & Technical Specifications */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Image Gallery Showcase */}
            <div className="relative h-96 sm:h-[480px] bg-white rounded-3xl border border-[#E7E5E4] overflow-hidden shadow-sm">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100 text-lg font-medium">
                  تصویر انبار محصول
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="bg-emerald-900 text-white text-sm font-bold px-3.5 py-1.5 rounded-xl shadow-md">
                  {product.origin}
                </span>
                <span className="bg-stone-900 text-white text-sm font-bold px-3.5 py-1.5 rounded-xl shadow-md">
                  کالیبر {product.caliber}
                </span>
              </div>
            </div>

            {/* Technical Specifications Table */}
            <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-extrabold text-[#1C1917] mb-6 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-amber-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                مشخصات فنی و استانداردهای کیفی بار
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E5E4] flex justify-between items-center gap-3">
                  <span className="text-stone-500">سایز و کالیبر دانه:</span>
                  <span className="font-bold text-[#1C1917]">
                    {product.caliber}
                  </span>
                </div>
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E5E4] flex justify-between items-center gap-3">
                  <span className="text-stone-500">درصد ضایعات:</span>
                  <span className="font-bold text-[#1C1917]">
                    {typeof product.wastePercent === "number"
                      ? `${product.wastePercent.toLocaleString("fa-IR")}٪`
                      : "ثبت نشده"}
                  </span>
                </div>
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E5E4] flex justify-between items-center gap-3">
                  <span className="text-stone-500">درصد رطوبت:</span>
                  <span className="font-bold text-[#1C1917]">
                    {typeof product.moisturePercent === "number"
                      ? `${product.moisturePercent.toLocaleString("fa-IR")}٪`
                      : "ثبت نشده"}
                  </span>
                </div>
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E5E4] flex justify-between items-center gap-3">
                  <span className="text-stone-500">مبدأ بارگیری:</span>
                  <span className="font-bold text-[#1C1917]">
                    {product.origin}
                  </span>
                </div>
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E5E4] flex justify-between items-center gap-3">
                  <span className="text-stone-500">نوع بسته‌بندی:</span>
                  <span className="font-bold text-[#1C1917]">
                    {product.packaging}
                  </span>
                </div>
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E5E4] flex justify-between items-center gap-3">
                  <span className="text-stone-500">وزن هر کیسه:</span>
                  <span className="font-bold text-[#1C1917]">
                    {product.packageWeightKg} کیلوگرم
                  </span>
                </div>
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E5E4] flex justify-between items-center gap-3">
                  <span className="text-stone-500">
                    حداقل مقدار سفارش (MOQ):
                  </span>
                  <span className="font-bold text-[#1C1917]">
                    {product.moqKg.toLocaleString("fa-IR")} کیلوگرم
                  </span>
                </div>
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E5E4] flex justify-between items-center gap-3">
                  <span className="text-stone-500">موجودی فعلی انبار:</span>
                  <span className="font-bold text-emerald-700">
                    {stockInTons} تن ({product.stockKg.toLocaleString("fa-IR")}{" "}
                    کیلو)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Left Column: Sticky Tier Pricing Calculator */}
          <div className="lg:col-span-5">
            <TierCalculator product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
