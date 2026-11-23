"use client";

import { useActionState } from "react";
import { toggleDiscountStatus } from "@/app/admin/actions";

interface Discount {
  _id: string;
  name: string;
  description?: string;
  type: "VOLUME" | "PERCENTAGE" | "FIXED_AMOUNT" | "TIERED";
  scope: "GLOBAL" | "PRODUCT" | "CATEGORY";
  productIds?: string[];
  category?: string;
  tiers: Array<{
    minQuantity: number;
    maxQuantity?: number | null;
    discountValue: number;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  }>;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  usageLimit?: number | null;
  usageCount: number;
  createdAt: string;
}

const SCOPE_LABELS: Record<string, string> = {
  GLOBAL: "سراسری",
  PRODUCT: "محصول خاص",
  CATEGORY: "دسته‌بندی",
};

const TYPE_LABELS: Record<string, string> = {
  VOLUME: "حجمی",
  PERCENTAGE: "درصدی",
  FIXED_AMOUNT: "مبلغ ثابت",
  TIERED: "پشتیبانی پلکانی",
};

interface DiscountListProps {
  discounts: Discount[];
}

export default function DiscountList({ discounts }: DiscountListProps) {
  const [, toggleAction] = useActionState(toggleDiscountStatus, { error: "", success: "" });

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-x-auto">
      <table className="w-full min-w-full text-right text-sm sm:min-w-[700px]">
        <thead className="bg-stone-100 text-xs font-bold text-stone-600">
          <tr>
            <th className="p-3">نام</th>
            <th className="p-3">نوع</th>
            <th className="p-3">دامنه</th>
            <th className="p-3">بازه تاریخ</th>
            <th className="p-3">استفاده</th>
            <th className="p-3">وضعیت</th>
            <th className="p-3">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {discounts.length === 0 ? (
            <tr>
              <td className="p-6 text-center text-stone-500" colSpan={7}>
                تخفیفی تعریف نشده است.
              </td>
            </tr>
          ) : (
            discounts.map((d) => (
              <tr key={d._id} className="hover:bg-stone-50/50">
                <td className="p-3 font-bold text-stone-900">{d.name}</td>
                <td className="p-3 text-stone-600">{TYPE_LABELS[d.type]}</td>
                <td className="p-3 text-stone-600">{SCOPE_LABELS[d.scope]}</td>
                <td className="p-3 text-stone-500 whitespace-nowrap">
                  {new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(d.startDate))}
                  {d.endDate ? ` - ${new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(d.endDate))}` : ""}
                </td>
                <td className="p-3 text-stone-600">
                  {d.usageCount} {d.usageLimit ? ` / ${d.usageLimit}` : ""}
                </td>
                <td className="p-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                    d.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-700"
                  }`}>
                    {d.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="p-3">
                  <form action={toggleAction}>
                    <input type="hidden" name="discountId" value={d._id} />
                    <button type="submit" className={`text-sm font-semibold ${d.isActive ? "text-rose-600 hover:text-rose-700" : "text-emerald-600 hover:text-emerald-700"}`}>
                      {d.isActive ? "غیرفعال" : "فعال"}
                    </button>
                  </form>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Mobile card view */}
      <div className="xl:hidden space-y-3 p-4">
        {discounts.length === 0 ? (
          <div className="p-6 text-center text-stone-500">
            تخفیفی تعریف نشده است.
          </div>
        ) : (
          discounts.map((d) => (
            <div key={d._id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-stone-900">{d.name}</span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                  d.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-700"
                }`}>
                  {d.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <span className="text-stone-400 block">نوع</span>
                  <span className="text-stone-600">{TYPE_LABELS[d.type]}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">دامنه</span>
                  <span className="text-stone-600">{SCOPE_LABELS[d.scope]}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">تاریخ آغاز</span>
                  <span className="text-stone-600">
                    {new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(d.startDate))}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block">استفاده</span>
                  <span className="text-stone-600">
                    {d.usageCount} {d.usageLimit ? ` / ${d.usageLimit}` : ""}
                  </span>
                </div>
              </div>
              <form action={toggleAction} className="flex items-center gap-2">
                <input type="hidden" name="discountId" value={d._id} />
                <button type="submit" className={`flex-1 min-h-8 rounded-lg px-3 text-xs font-bold text-white transition ${
                  d.isActive ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}>
                  {d.isActive ? "غیرفعال" : "فعال"}
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}