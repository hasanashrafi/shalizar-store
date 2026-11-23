"use client";

import { useActionState, useState, useMemo, useEffect } from "react";
import { createProduct, type AdminActionState } from "@/app/admin/actions";
import PersianDatePicker from "@/components/ui/PersianDatePicker";

const initialState: AdminActionState = {};

const inputClass =
  "mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100";

const PRODUCT_TYPES = [
  { value: "beans", label: "لوبیا" },
  { value: "chickpea", label: "نخود" },
  { value: "lentils", label: "عدس" },
  { value: "mash", label: "ماش" },
  { value: "soybean", label: "سویا" },
  { value: "cowpea", label: "لوبیا چتی" },
  { value: "pinto", label: "لوبیا پینتو" },
  { value: "red_kidney", label: "لوبیا قرمز" },
  { value: "white_kidney", label: "لوبیا سفید" },
  { value: "black_eyed_pea", label: "لوبیا چشمه" },
  { value: "nabat", label: "نبات (زرد/سفید)" },
  { value: "sugar", label: "قند" },
  { value: "raisin", label: "کشمش" },
  { value: "barley", label: "جو" },
  { value: "corn", label: "ذرت" },
  { value: "tea", label: "چای" },
  { value: "rice", label: "برنج" },
  { value: "other", label: "سایر (ثبت دستی)" },
] as const;

const ORIGINS = [
  { value: "iran", label: "ایران" },
  { value: "canada", label: "کانادا" },
  { value: "usa", label: "آمریکا" },
  { value: "argentina", label: "آرژانتین" },
  { value: "turkey", label: "ترکیه" },
  { value: "russia", label: "روسیه" },
  { value: "ukraine", label: "اوکراین" },
  { value: "kazakhstan", label: "قزاقستان" },
  { value: "china", label: "چین" },
  { value: "other", label: "سایر" },
] as const;

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 sm:p-5">
      <legend className="flex items-center gap-2 px-1 text-sm font-extrabold text-stone-900">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-xs text-amber-900">
          {step}
        </span>
        {title}
      </legend>
      {hint && <p className="mt-1 px-1 text-xs leading-5 text-stone-500">{hint}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </fieldset>
  );
}

export default function NewProductForm() {
  const [state, formAction, isPending] = useActionState(
    createProduct,
    initialState,
  );
  const [productType, setProductType] = useState("");
  const [origin, setOrigin] = useState("");
  const [caliber, setCaliber] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [stockKg, setStockKg] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Auto-generated slug (derived state)
  const slug = useMemo(() => {
    if (productType && origin && caliber) {
      return `${productType}-${origin}-${caliber}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");
    }
    return "";
  }, [productType, origin, caliber]);

  const purchaseTotal = useMemo(() => {
    const kg = Number(stockKg);
    const price = Number(purchasePrice);
    if (!Number.isFinite(kg) || !Number.isFinite(price)) return 0;
    return Math.max(0, kg) * Math.max(0, price);
  }, [stockKg, purchasePrice]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("فقط فایل تصویر مجاز است");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("حجم تصویر باید کمتر از ۵ مگابایت باشد");
        return;
      }
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Build tiers from base price and discount percentages
  const getTiers = () => {
    if (!basePrice) return "";
    const price = Number(basePrice);
    if (isNaN(price)) return "";
    // Default tiers: 1-999kg, 1000-2999kg, 3000+kg with 0%, 4%, 9% discount
    const tier1 = price;
    const tier2 = Math.round(price * 0.96);
    const tier3 = Math.round(price * 0.91);
    return `1,999,${tier1}\n1000,2999,${tier2}\n3000,*,${tier3}`;
  };

  return (
    <details
      open
      className="mb-6 rounded-2xl border border-stone-200 bg-white shadow-sm"
    >
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-5 py-4">
        <span className="flex items-center gap-2 font-bold text-amber-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-base">
            📦
          </span>
          ثبت و انتشار کالای جدید + خرید
        </span>
        <span className="text-[11px] font-semibold text-stone-400">
          نوع، تناژ، قیمت خرید و فروش را در همین مرحله وارد کنید
        </span>
      </summary>

      <div className="mb-5 flex items-start gap-2 border-t border-stone-100 bg-emerald-50/70 px-5 py-3 text-xs leading-6 text-emerald-900">
        <span aria-hidden="true">✅</span>
        <p>
          با ثبت این فرم، کالا خودکار در <b>موجودی انبار</b> و{" "}
          <b>لیست خرید‌ها</b> ثبت می‌شود و نیازی به ورود جداگانه به بخش خرید
          نیست.
        </p>
      </div>

      <form action={formAction} className="space-y-5 border-t border-stone-100 p-5">
        <Section
          step="۱"
          title="مشخصات و نوع کالا"
          hint="نوع کالا، مبدأ و کالیبر را انتخاب کنید تا شناسه محصول خودکار ساخته شود."
        >
          {/* Product Type Select */}
          <label className="text-sm font-semibold">
            نوع محصول *
            <select
              name="productType"
              required
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className={inputClass}
            >
              <option value="">انتخاب نوع محصول</option>
              {PRODUCT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          {/* Origin Select */}
          <label className="text-sm font-semibold">
            مبدأ بار *
            <select
              name="origin"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className={inputClass}
            >
              <option value="">انتخاب مبدأ</option>
              {ORIGINS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          {/* Caliber */}
          <label className="text-sm font-semibold">
            کالیبر *
            <input
              name="caliber"
              required
              placeholder="مثال: ۹ دستچین، ۷-۸ میلیمتر"
              value={caliber}
              onChange={(e) => setCaliber(e.target.value)}
              className={inputClass}
            />
          </label>

          {/* Auto-generated Slug (readonly) */}
          <label className="text-sm font-semibold">
            شناسه محصول (slug) - خودکار
            <input
              name="slug"
              required
              value={slug}
              readOnly
              dir="ltr"
              className={`${inputClass} cursor-not-allowed bg-stone-50`}
            />
          </label>

          {/* Packaging */}
          <label className="text-sm font-semibold">
            نوع بسته‌بندی *
            <input
              name="packaging"
              required
              placeholder="کیسه ۳۰ کیلویی"
              className={inputClass}
            />
          </label>

          {/* Package Weight */}
          <label className="text-sm font-semibold">
            وزن هر کیسه (کیلوگرم) *
            <input
              name="packageWeightKg"
              type="number"
              min="1"
              max="1000"
              step="1"
              required
              className={inputClass}
            />
          </label>

          {/* Waste Percent */}
          <label className="text-sm font-semibold">
            درصد بوجار / ضایعات
            <input
              name="wastePercent"
              type="number"
              min="0"
              max="100"
              step="0.01"
              className={inputClass}
            />
          </label>

          {/* Moisture Percent */}
          <label className="text-sm font-semibold">
            درصد رطوبت
            <input
              name="moisturePercent"
              type="number"
              min="0"
              max="100"
              step="0.01"
              className={inputClass}
            />
          </label>

          {/* Image Upload */}
          <label className="text-sm font-semibold sm:col-span-2">
            تصویر محصول
            <input
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 w-full text-sm text-stone-600 file:mr-4 file:rounded-xl file:border-0 file:bg-amber-600 file:px-4 file:py-2 file:text-white file:text-sm hover:file:bg-amber-700"
            />
            {imagePreview && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="پیش‌نمایش تصویر"
                  className="max-h-40 rounded-xl border border-stone-200"
                />
              </div>
            )}
          </label>
        </Section>

        <Section
          step="۲"
          title="موجودی و خرید (ثبت خودکار)"
          hint="تناژ خریداری‌شده/موجودی و قیمت خرید را وارد کنید؛ رکورد خرید خودکار ساخته می‌شود."
        >
          {/* Initial Stock */}
          <label className="text-sm font-semibold">
            تناژ خریداری‌شده / موجودی (کیلوگرم) *
            <input
              name="stockKg"
              type="number"
              min="0"
              required
              value={stockKg}
              onChange={(e) => setStockKg(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs font-normal text-stone-500">
              همان تناژی که خریداری شده و اکنون در انبار موجود است
            </p>
          </label>

          {/* Purchase Price per Kg (Cost) */}
          <label className="text-sm font-semibold">
            قیمت خرید هر کیلوگرم (تومان) *
            <input
              name="purchasePricePerKg"
              type="number"
              min="0"
              step="100"
              required
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="مثال: ۱۲۰۰۰۰"
              className={inputClass}
            />
            <p className="mt-1 text-xs font-normal text-stone-500">
              بهای تمام‌شده هر کیلو برای محاسبه سود
            </p>
          </label>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm sm:col-span-2 lg:col-span-1">
            <span className="block text-xs text-emerald-700">بهای کل خرید</span>
            <span className="mt-1 block text-lg font-black text-emerald-900">
              {purchaseTotal.toLocaleString("fa-IR")} تومان
            </span>
          </div>

          {/* Purchase supplier */}
          <label className="text-sm font-semibold">
            شرکت / تامین‌کننده خرید
            <input
              name="supplierName"
              placeholder="مثال: شرکت بازرگانی حبوبات"
              className={inputClass}
            />
            <p className="mt-1 text-xs font-normal text-stone-500">
              اختیاری — در صورت خالی بودن «ثبت مستقیم انبار» درج می‌شود
            </p>
          </label>

          {/* Supplier phone */}
          <label className="text-sm font-semibold">
            تلفن تامین‌کننده
            <input
              name="supplierPhone"
              type="tel"
              placeholder="09123456789"
              className={inputClass}
            />
          </label>

          {/* Purchase date (Persian calendar) */}
          <label className="text-sm font-semibold">
            تاریخ خرید
            <PersianDatePicker
              name="purchaseDate"
              className="mt-1"
              placeholder="انتخاب تاریخ خرید"
            />
          </label>

          {/* Purchase invoice number */}
          <label className="text-sm font-semibold">
            شماره فاکتور خرید
            <input
              name="invoiceNumber"
              placeholder="مثال: ۱۴۰۲/۱۲۳"
              className={inputClass}
            />
          </label>

          {/* Purchase payment status */}
          <label className="text-sm font-semibold">
            نوع پرداخت خرید
            <select
              name="purchasePaymentStatus"
              className={inputClass}
              defaultValue="PAID"
            >
              <option value="PAID">پرداخت‌شده (نقدی)</option>
              <option value="PARTIAL">پرداخت جزئی</option>
              <option value="PENDING">در انتظار / نسیه</option>
            </select>
          </label>

          {/* Purchase paid amount */}
          <label className="text-sm font-semibold">
            مبلغ پرداخت‌شده (تومان)
            <input
              name="purchasePaidAmount"
              type="number"
              min="0"
              step="1000"
              placeholder="در صورت پرداخت جزئی"
              className={inputClass}
            />
          </label>

          {/* MOQ */}
          <label className="text-sm font-semibold">
            حداقل سفارش (کیلوگرم) *
            <input
              name="moqKg"
              type="number"
              min="1"
              required
              className={inputClass}
            />
          </label>
        </Section>

        <Section
          step="۳"
          title="قیمت فروش"
          hint="قیمت پایه هر کیلو را وارد کنید؛ پلکان‌های قیمتی خودکار ساخته می‌شوند."
        >
          {/* Base Price per Kg */}
          <label className="text-sm font-semibold">
            قیمت فروش پایه هر کیلوگرم (تومان) *
            <input
              name="basePriceInput"
              type="number"
              min="1"
              step="100"
              required
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="مثال: ۱۴۵۰۰۰"
              className={inputClass}
            />
            <p className="mt-1 text-xs font-normal text-stone-500">
              پلکان‌ها: ۱–۹۹۹ کیلو (بدون تخفیف)، ۱۰۰۰–۲۹۹۹ (۴٪ تخفیف)، ۳۰۰۰+
              (۹٪ تخفیف)
            </p>
          </label>
        </Section>

        {/* Hidden fields for server action */}
        <input name="title" type="hidden" value={productType} />
        <input name="origin" type="hidden" value={origin} />
        <input name="caliber" type="hidden" value={caliber} />
        <input name="slug" type="hidden" value={slug} />
        <input name="tiers" type="hidden" value={getTiers()} />
        <input name="basePrice" type="hidden" value={basePrice} />
        <input name="purchasePricePerKg" type="hidden" value={purchasePrice} />

        {state.error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-800"
          >
            {state.error}
          </p>
        )}
        {state.success && (
          <p
            role="status"
            className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
          >
            {state.success}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-amber-700 px-5 py-3.5 font-bold text-white transition hover:bg-amber-800 disabled:opacity-60 sm:w-auto"
        >
          {isPending ? "در حال ذخیره..." : "انتشار کالا و ثبت خرید"}
        </button>
      </form>
    </details>
  );
}