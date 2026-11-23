"use client";

import { useActionState } from "react";
import { createExpense } from "@/app/admin/actions";
import PersianDatePicker from "@/components/ui/PersianDatePicker";

const EXPENSE_CATEGORIES = [
  "TRANSPORT",
  "WAREHOUSE",
  "SALARY",
  "UTILITIES",
  "MARKETING",
  "MAINTENANCE",
  "INSURANCE",
  "TAX",
  "OTHER",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  TRANSPORT: "حمل و نقل",
  WAREHOUSE: "انبار",
  SALARY: "حقوق و دستمزد",
  UTILITIES: "آب/برق/گاز",
  MARKETING: "تبلیغات",
  MAINTENANCE: "تعمیرات",
  INSURANCE: "بیمه",
  TAX: "مالیات",
  OTHER: "سایر",
};

export default function ExpenseForm() {
  const [, formAction] = useActionState(createExpense, { error: "", success: "" });

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-stone-900">ثبت هزینه جدید</h2>
      <div className="space-y-3">
        <label className="block text-sm font-semibold">
          عنوان *
          <input name="title" required className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" />
        </label>
        <label className="block text-sm font-semibold">
          توضیحات
          <textarea name="description" rows={2} className="mt-1 h-20 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" />
        </label>
        <label className="block text-sm font-semibold">
          مبلغ (تومان) *
          <input name="amount" type="number" required className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" />
        </label>
        <label className="block text-sm font-semibold">
          دسته‌بندی *
          <select name="category" required className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100">
            <option value="">انتخاب کنید</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          روش پرداخت *
          <select name="paymentMethod" required className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100">
            <option value="CASH">نقد</option>
            <option value="BANK_TRANSFER">انتقال بانکی</option>
            <option value="CHECK">چک</option>
            <option value="CARD">کارت</option>
            <option value="OTHER">سایر</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          وضعیت پرداخت
          <select name="paymentStatus" className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100">
            <option value="PENDING">در انتظار</option>
            <option value="PAID">پرداخت‌شده</option>
            <option value="PARTIAL">مخلوط</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          مبلغ پرداخت‌شده
          <input name="paidAmount" type="number" className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" />
        </label>
        <label className="block text-sm font-semibold">
          نام وندور/تحویل‌دهنده
          <input name="vendorName" className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" />
        </label>
        <label className="block text-sm font-semibold">
          شماره فاکتور
          <input name="invoiceNumber" className="mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" />
        </label>
        <label className="block text-sm font-semibold">
          تاریخ فاکتور
          <PersianDatePicker name="invoiceDate" className="mt-1" placeholder="تاریخ فاکتور" />
        </label>
        <label className="block text-sm font-semibold">
          تاریخ سررسید
          <PersianDatePicker name="dueDate" className="mt-1" placeholder="تاریخ سررسید" />
        </label>
        <label className="block text-sm font-semibold">
          یادداشت
          <textarea name="notes" rows={2} className="mt-1 h-20 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100" />
        </label>
        <button type="submit" className="w-full rounded-xl bg-red-700 py-3 font-bold text-white hover:bg-red-800">
          ثبت هزینه
        </button>
      </div>
    </form>
  );
}