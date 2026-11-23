"use client";

import { useActionState, useState } from "react";
import { updateProduct, type AdminActionState } from "@/app/admin/actions";

interface ProductEditFormProps {
  product: {
    _id: string;
    caliber: string;
    packaging: string;
    packageWeightKg: number;
    moqKg: number;
    stockKg: number;
    purchasePricePerKg?: number;
    wastePercent?: number | null;
    moisturePercent?: number | null;
    basePrice: number;
  };
}

const inputClass =
  "mt-1 h-10 w-full rounded-lg border border-stone-300 bg-white px-2 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100";

export default function ProductEditForm({ product }: ProductEditFormProps) {
  const [state, formAction, isPending] = useActionState<AdminActionState, FormData>(
    updateProduct,
    {},
  );
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-amber-700 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-50"
      >
        {open ? "بستن ویرایش" : "ویرایش محصول"}
      </button>

      {open && (
        <form
          action={formAction}
          className="mt-3 grid gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <input type="hidden" name="productId" value={product._id} />

          <label className="text-xs font-semibold">
            کالیبر
            <input name="caliber" defaultValue={product.caliber} required className={inputClass} />
          </label>

          <label className="text-xs font-semibold">
            نوع بسته‌بندی
            <input name="packaging" defaultValue={product.packaging} required className={inputClass} />
          </label>

          <label className="text-xs font-semibold">
            وزن هر کیسه (کیلوگرم)
            <input name="packageWeightKg" type="number" min="1" defaultValue={product.packageWeightKg} required className={inputClass} />
          </label>

          <label className="text-xs font-semibold">
            حداقل سفارش (MOQ - کیلوگرم)
            <input name="moqKg" type="number" min="1" defaultValue={product.moqKg} required className={inputClass} />
          </label>

          <label className="text-xs font-semibold">
            موجودی انبار (کیلوگرم)
            <input name="stockKg" type="number" min="0" defaultValue={product.stockKg} required className={inputClass} />
          </label>

          <label className="text-xs font-semibold">
            قیمت پایه هر کیلوگرم (تومان)
            <input name="basePrice" type="number" min="1" defaultValue={product.basePrice} required className={inputClass} />
          </label>

          <label className="text-xs font-semibold">
            قیمت خرید هر کیلوگرم (تومان)
            <input name="purchasePricePerKg" type="number" min="0" defaultValue={product.purchasePricePerKg ?? ""} className={inputClass} />
          </label>

          <label className="text-xs font-semibold">
            درصد بوجار / ضایعات
            <input name="wastePercent" type="number" min="0" max="100" step="0.01" defaultValue={product.wastePercent ?? ""} className={inputClass} />
          </label>

          <label className="text-xs font-semibold">
            درصد رطوبت
            <input name="moisturePercent" type="number" min="0" max="100" step="0.01" defaultValue={product.moisturePercent ?? ""} className={inputClass} />
          </label>

          <label className="text-xs font-semibold sm:col-span-2">
            تصویر جدید محصول (اختیاری)
            <input name="imageFile" type="file" accept="image/*" className="mt-1 w-full text-xs text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-600 file:px-3 file:py-1.5 file:text-xs file:text-white hover:file:bg-amber-700" />
          </label>

          <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-amber-700 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800 disabled:opacity-60"
            >
              {isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
            {state.error && (
              <span className="text-xs font-semibold text-rose-700">{state.error}</span>
            )}
            {state.success && (
              <span className="text-xs font-semibold text-emerald-700">{state.success}</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}