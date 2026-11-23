"use client";

import { useActionState } from "react";
import { createDiscount } from "@/app/admin/actions";
import PersianDatePicker from "@/components/ui/PersianDatePicker";

export default function DiscountForm() {
  const [, formAction] = useActionState(createDiscount, { error: "", success: "" });

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-stone-900">تعریف تخفیف جدید</h2>
      <div className="space-y-3">
        <label className="block text-sm font-semibold">
          نام تخفیف *
          <input name="name" required placeholder="مثلا: تخفیف خرید انبوه" className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" />
        </label>
        <label className="block text-sm font-semibold">
          نوع تخفیف *
          <select name="type" required className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100">
            <option value="TIERED">پشتیبانی پلکانی (پیش‌فرض)</option>
            <option value="VOLUME">حجمی</option>
            <option value="PERCENTAGE">درصدی</option>
            <option value="FIXED_AMOUNT">مبلغ ثابت</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          دامنه *
          <select name="scope" required className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100">
            <option value="GLOBAL">سراسری (همه محصولات)</option>
            <option value="PRODUCT">محصول خاص</option>
            <option value="CATEGORY">دسته‌بندی</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          شناسه محصولات (برای scope=PRODUCT، با کاما جدا کنید)
          <input name="productIds" placeholder="productId1,productId2" className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" />
        </label>
        <label className="block text-sm font-semibold">
          دسته‌بندی (برای scope=CATEGORY)
          <input name="category" placeholder="beans" className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" />
        </label>
        <label className="block text-sm font-semibold">
          تاریخ شروع *
          <PersianDatePicker name="startDate" required className="mt-1" placeholder="تاریخ شروع تخفیف" />
        </label>
        <label className="block text-sm font-semibold">
          تاریخ پایان (اختیاری)
          <PersianDatePicker name="endDate" className="mt-1" placeholder="تاریخ پایان تخفیف" />
        </label>
        <label className="block text-sm font-semibold">
          محدودیت استفاده (اختیاری)
          <input name="usageLimit" type="number" placeholder="تعداد استفاده" className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" />
        </label>
        <label className="block text-sm font-semibold">
          پلکان‌های تخفیف *
          <p className="mt-1 text-xs text-stone-500">هر خط: حداقل تعداد, حداکثر تعداد (یا *), مقدار تخفیف, نوع (PERCENTAGE/FIXED_AMOUNT)</p>
          <textarea
            name="tiers"
            rows={4}
            required
            placeholder="1,999,10,PERCENTAGE&#10;1000,*,15,PERCENTAGE"
            className="mt-1 h-28 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100 font-mono text-sm"
          />
        </label>
        <label className="block text-sm font-semibold">
          توضیحات
          <textarea name="description" rows={2} className="mt-1 h-20 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" />
        </label>
        <button type="submit" className="w-full rounded-xl bg-violet-700 py-3 font-bold text-white hover:bg-violet-800">
          ثبت تخفیف
        </button>
      </div>
    </form>
  );
}