import Link from "next/link";

import { updateBasePrice } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import NewProductForm from "./NewProductForm";
import ProductEditForm from "./ProductEditForm";

export const dynamic = "force-dynamic";

const GROCERY_KEYS = ["نبات", "قند", "کشمش", "چای", "برنج", "جو", "ذرت"];

function categoryOf(title: string): "grocery" | "legumes" {
  return GROCERY_KEYS.some((k) => title.includes(k)) ? "grocery" : "legumes";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  await requireAdmin();
  await connectToDatabase();

  const { cat } = await searchParams;
  const all = await Product.find().sort({ updatedAt: -1 }).limit(300).lean();

  const groceryCount = all.filter((p) => categoryOf(p.title) === "grocery").length;
  const legumesCount = all.length - groceryCount;
  const totalStockKg = all.reduce((sum, p) => sum + (p.stockKg || 0), 0);

  const products =
    cat === "grocery" || cat === "legumes"
      ? all.filter((p) => categoryOf(p.title) === cat)
      : all;

  const categories = [
    { key: "", label: "همه کالاها", count: all.length },
    { key: "legumes", label: "حبوبات", count: legumesCount },
    { key: "grocery", label: "نبات، قند، غلات و چای", count: groceryCount },
  ];

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl">


        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl">
            مدیریت انبار و قیمت‌ها
          </h1>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            برای انتشار کالای جدید، فرم زیر را کامل کنید. با یک ثبت، کالا منتشر
            می‌شود و خرید و موجودی آن خودکار در همین انبار ثبت می‌گردد.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="space-y-4 lg:sticky lg:top-6">
              <div className="rounded-2xl bg-emerald-900 p-5 text-white shadow-md">
                <p className="text-xs text-emerald-100/80">تعداد اقلام انبار</p>
                <p className="mt-1 text-2xl font-black sm:text-3xl">
                  {all.length.toLocaleString("fa-IR")}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-xs">
                  <span className="text-emerald-100/80">موجودی کل</span>
                  <span className="font-bold text-amber-300">
                    {(totalStockKg / 1000).toLocaleString("fa-IR", {
                      maximumFractionDigits: 1,
                    })}{" "}
                    تن
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
                <p className="px-2 py-1 text-xs font-bold text-stone-500">
                  دسته‌بندی کالاها
                </p>
                <nav className="mt-1 space-y-1">
                  {categories.map((c) => {
                    const href = c.key
                      ? `/admin/products?cat=${c.key}`
                      : "/admin/products";
                    const isActive =
                      (c.key || "") === (cat || "") ? true : false;
                    return (
                      <Link
                        key={c.key || "all"}
                        href={href}
                        className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                          isActive
                            ? "bg-amber-600 text-white shadow-sm"
                            : "text-stone-600 hover:bg-amber-50 hover:text-amber-800"
                        }`}
                      >
                        <span>{c.label}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {c.count.toLocaleString("fa-IR")}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="lg:col-span-3">
            <NewProductForm />

            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
              <table className="w-full min-w-full text-right text-sm sm:min-w-[700px]">
                <thead className="bg-stone-100 text-xs font-bold text-stone-600">
                  <tr>
                    <th className="p-3">بار / مبدأ</th>
                    <th className="p-3">کالیبر</th>
                    <th className="p-3">موجودی</th>
                    <th className="p-3">قیمت خرید / ارزش</th>
                    <th className="p-3">پلکان‌ها</th>
                    <th className="p-3">تغییر قیمت پایه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((product) => (
                    <tr key={product._id.toString()} className="align-top">
                      <td className="p-3">
                        <span className="font-bold text-stone-900">
                          {product.title}
                        </span>
                        <span className="mt-1 block text-xs text-stone-500">
                          {product.origin}
                        </span>
                      </td>
                      <td className="p-3">{product.caliber}</td>
                      <td className="p-3 font-bold text-emerald-800">
                        {(product.stockKg / 1000).toLocaleString("fa-IR", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        تن
                        <span className="mt-1 block text-xs font-normal text-stone-500">
                          {product.stockKg.toLocaleString("fa-IR")} کیلوگرم
                        </span>
                      </td>
                      <td className="p-3 text-xs leading-6">
                        <div className="font-bold text-stone-800">
                          {typeof product.purchasePricePerKg === "number"
                            ? `${product.purchasePricePerKg.toLocaleString("fa-IR")} تومان/کیلو`
                            : "—"}
                        </div>
                        <div className="text-stone-500">
                          ارزش موجودی:{" "}
                          {(
                            (product.purchasePricePerKg || 0) *
                            (product.stockKg || 0)
                          ).toLocaleString("fa-IR")}{" "}
                          تومان
                        </div>
                      </td>
                      <td className="p-3">
                        <ul className="space-y-1 text-xs text-stone-600">
                          {product.tiers.map((tier, index) => (
                            <li key={`${tier.minKg}-${index}`}>
                              از {tier.minKg.toLocaleString("fa-IR")} کیلو:{" "}
                              {tier.pricePerKg.toLocaleString("fa-IR")} تومان/کیلو
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-2">
                          <form
                            action={updateBasePrice}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="hidden"
                              name="productId"
                              value={product._id.toString()}
                            />
                            <input
                              type="number"
                              name="basePrice"
                              min="1"
                              max="1000000000"
                              step="1"
                              required
                              defaultValue={product.tiers[0]?.pricePerKg ?? ""}
                              aria-label={`قیمت پایه جدید ${product.title}`}
                              className="h-9 w-32 rounded-lg border border-stone-300 px-2 text-xs"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-stone-900 px-2.5 py-2 text-xs font-bold text-white hover:bg-stone-700"
                            >
                              قیمت پایه
                            </button>
                          </form>
                          <ProductEditForm
                            product={{
                              _id: product._id.toString(),
                              caliber: product.caliber,
                              packaging: product.packaging,
                              packageWeightKg: product.packageWeightKg,
                              moqKg: product.moqKg,
                              stockKg: product.stockKg,
                              purchasePricePerKg: product.purchasePricePerKg,
                              wastePercent: product.wastePercent,
                              moisturePercent: product.moisturePercent,
                              basePrice: product.tiers[0]?.pricePerKg ?? 0,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-stone-500">
                      هنوز باری در این دسته ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile card view */}
            <div className="xl:hidden space-y-3 mt-4 p-4">
              {products.length === 0 ? (
                <div className="p-6 text-center text-stone-500">
                  هنوز باری در این دسته ثبت نشده است.
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product._id.toString()}
                    className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-stone-900">{product.title}</span>
                      <span className="text-[10px] text-stone-500">{product.origin}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-stone-400 block">کالیبر</span>
                        <span className="text-stone-600">{product.caliber}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">موجودی</span>
                        <span className="font-bold text-emerald-700">
                          {(product.stockKg / 1000).toLocaleString("fa-IR", { maximumFractionDigits: 2 })} تن
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">قیمت خرید</span>
                        <span className="text-stone-600">
                          {typeof product.purchasePricePerKg === "number"
                            ? product.purchasePricePerKg.toLocaleString("fa-IR") + " تومان/کیلو"
                            : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">ارزش موجودی</span>
                        <span className="text-stone-500">
                          {(((product.purchasePricePerKg || 0) * (product.stockKg || 0)).toLocaleString("fa-IR"))} تومان
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-stone-600">
                      {product.tiers.map((tier, index) => (
                        <div key={`${tier.minKg}-${index}`} className="flex justify-between">
                          <span>از {tier.minKg.toLocaleString("fa-IR")} کیلو</span>
                          <span className="font-bold">{tier.pricePerKg.toLocaleString("fa-IR")} تومان/کیلو</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <ProductEditForm
                        product={{
                          _id: product._id.toString(),
                          caliber: product.caliber,
                          packaging: product.packaging,
                          packageWeightKg: product.packageWeightKg,
                          moqKg: product.moqKg,
                          stockKg: product.stockKg,
                          purchasePricePerKg: product.purchasePricePerKg,
                          wastePercent: product.wastePercent,
                          moisturePercent: product.moisturePercent,
                          basePrice: product.tiers[0]?.pricePerKg ?? 0,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}