import Link from "next/link";

import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export default async function AdminProductViewsPage() {
  await requireAdmin();
  await connectToDatabase();

  const products = await Product.find({})
    .select("title slug origin caliber stockKg views imageUrl")
    .sort({ views: -1, updatedAt: -1 })
    .limit(300)
    .lean();

  const totalViews = products.reduce((sum, p) => sum + (p.views ?? 0), 0);
  const maxViews = products.reduce((max, p) => Math.max(max, p.views ?? 0), 0);
  const viewedProducts = products.filter((p) => (p.views ?? 0) > 0);

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-6xl">


        <div className="mb-6">
          <h1 className="text-xl font-black text-[#1C1917] sm:text-2xl">
            بازدید محصولات
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            میزان بازدید هر کالا از صفحه جزئیات محصول (هر بازدید یکتا در هر نشست
            مرورگر شمارش می‌شود).
          </p>
        </div>

        {/* KPI */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E7E5E4] bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">مجموع بازدیدها</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-900">
              {totalViews.toLocaleString("fa-IR")}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E7E5E4] bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">محصولات بازدیدشده</p>
            <p className="mt-2 text-2xl font-extrabold text-amber-700">
              {viewedProducts.length.toLocaleString("fa-IR")} از{" "}
              {products.length.toLocaleString("fa-IR")}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E7E5E4] bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">پربازدیدترین محصول</p>
            <p className="mt-2 truncate text-base font-extrabold text-[#1C1917]">
              {viewedProducts[0]?.title ?? "—"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#E7E5E4] bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="bg-[#FAF8F5] text-xs font-bold text-stone-600">
              <tr>
                <th className="p-4">محصول</th>
                <th className="p-4">مبدأ / کالیبر</th>
                <th className="p-4">موجودی</th>
                <th className="p-4">بازدید</th>
                <th className="p-4 w-1/3">سهم بازدید</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {products.length === 0 ? (
                <tr>
                  <td className="p-12 text-center text-stone-500" colSpan={5}>
                    محصولی ثبت نشده است.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const views = product.views ?? 0;
                  const width =
                    maxViews > 0 ? Math.round((views / maxViews) * 100) : 0;
                  return (
                    <tr key={product._id.toString()} className="hover:bg-stone-50/50">
                      <td className="p-4">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="font-bold text-[#1C1917] hover:text-emerald-900 hover:underline"
                        >
                          {product.title}
                        </Link>
                      </td>
                      <td className="p-4 text-xs text-stone-500">
                        {product.origin} · {product.caliber}
                      </td>
                      <td className="p-4 text-stone-600">
                        {(product.stockKg ?? 0).toLocaleString("fa-IR")} کیلو
                      </td>
                      <td className="p-4 font-extrabold text-emerald-900">
                        {views.toLocaleString("fa-IR")}
                      </td>
                      <td className="p-4">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-l from-emerald-900 to-amber-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}