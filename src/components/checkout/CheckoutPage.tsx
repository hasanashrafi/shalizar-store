"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import type { CartItem } from "@/types";

export interface SavedCheckoutData {
  customerName: string;
  userPhone: string;
  companyName: string;
  nationalId: string;
  economicId: string;
  province: string;
  destinationCity: string;
  address: string;
  shippingType: "CARRIER" | "EXCLUSIVE_TRUCK" | "FACTORY_PICKUP";
  carrierName: string;
  hasSavedData: boolean;
}

function QuantityControl({
  item,
  onBags,
  onKg,
}: {
  item: CartItem;
  onBags: (productId: string, quantityBags: number) => void;
  onKg: (productId: string, requestedKg: number) => void;
}) {
  const maxKg = item.product?.stockKg ?? 0;
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={item.product?.moqKg ?? 1}
        max={maxKg || undefined}
        step={1}
        value={Math.round(item.requestedKg ?? item.totalKg)}
        onChange={(e) => {
          const kg = Number(e.target.value);
          if (Number.isFinite(kg) && kg > 0) {
            onKg(item.productId, kg);
          }
        }}
        aria-label={`مقدار کیلوگرم ${item.product?.title ?? ""}`}
        className="h-9 w-20 rounded-lg border border-stone-300 px-2 text-center text-sm font-bold outline-none focus:border-amber-600"
      />
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onBags(item.productId, item.quantityBags + 1)}
          aria-label="افزایش یک کیسه"
          className="h-4 w-6 rounded border border-stone-300 text-[10px] leading-none text-stone-700 hover:bg-stone-100"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => onBags(item.productId, item.quantityBags - 1)}
          disabled={item.quantityBags <= 1}
          aria-label="کاهش یک کیسه"
          className="h-4 w-6 rounded border border-stone-300 text-[10px] leading-none text-stone-700 hover:bg-stone-100 disabled:opacity-40"
        >
          −
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage({
  savedData,
}: {
  savedData?: SavedCheckoutData | null;
}) {
  const router = useRouter();
  const {
    items,
    getTotalCartWeightKg,
    getTotalCartPrice,
    getTotalBagsCount,
    updateBags,
    updateRequestedKg,
    removeItem,
    clearCart,
  } = useCartStore();

  const buildFormFromSaved = () => ({
    customerName: savedData?.customerName ?? "",
    userPhone: savedData?.userPhone ?? "",
    companyName: savedData?.companyName ?? "",
    nationalId: savedData?.nationalId ?? "",
    economicId: savedData?.economicId ?? "",
    province: savedData?.province || "تهران",
    destinationCity: savedData?.destinationCity ?? "",
    address: savedData?.address ?? "",
    shippingType: (savedData?.shippingType ?? "EXCLUSIVE_TRUCK") as
      | "CARRIER"
      | "EXCLUSIVE_TRUCK"
      | "FACTORY_PICKUP",
    carrierName: savedData?.carrierName ?? "",
    notes: "",
  });

  const [formData, setFormData] = useState(buildFormFromSaved);

  const applySavedData = () => {
    setFormData(buildFormFromSaved());
    setErrorMessage(null);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalWeightKg = getTotalCartWeightKg();
  const totalTons = (totalWeightKg / 1000).toFixed(2);
  const totalPrice = getTotalCartPrice();
  const totalBags = getTotalBagsCount();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage("سبد خرید شما خالی است.");
      return;
    }

    // Client-side validation for conditional required fields
    if (!formData.nationalId.trim() && !formData.economicId.trim()) {
      setErrorMessage("کد ملی یا شناسه ملی/اقتصادی خریدار را وارد کنید.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        items: items.map((item) => ({
          productId: item.productId,
          quantityBags: item.quantityBags,
          requestedKg: item.requestedKg ?? item.totalKg,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "خطا در ثبت سفارش");
      }

      // Clear cart on successful order submission
      clearCart();

      // Redirect to official order detail page
      router.push(`/orders/${data.orderId}`);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "خطایی در ارتباط با سرور رخ داد.",
      );
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 flex items-center justify-center sm:py-16">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 text-center max-w-lg shadow-sm sm:p-10">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
            🛒
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 mb-2">
            سبد خرید شما خالی است
          </h2>
          <p className="text-stone-500 text-sm mb-8">
            برای ثبت سفارش عمده و صدور پیش‌فاکتور، ابتدا محصولات مورد نظر خود را
            به سبد خرید اضافه کنید.
          </p>
          <Link
            href="/products"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-full shadow-md transition-all sm:px-8 sm:py-3.5"
          >
            مشاهده کاتالوگ محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <Link href="/" className="hover:text-amber-700 transition-colors">
            صفحه اصلی
          </Link>
          <span>/</span>
          <Link
            href="/products"
            className="hover:text-amber-700 transition-colors"
          >
            محصولات
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-semibold">
            تکمیل سفارش و تسویه حساب B2B
          </span>
        </nav>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 mb-4 sm:mb-6">
          ثبت نهایی سفارش و انتخاب لجستیک باربری
        </h1>

        {/* گام‌های سفارش */}
        <ol className="mb-8 flex items-center gap-2 overflow-x-auto rounded-2xl border border-[#E5E5E2] bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
          {[
            { n: "۱", label: "اطلاعات ارسال" },
            { n: "۲", label: "روش ارسال" },
            { n: "۳", label: "پرداخت نهایی" },
          ].map((step, index) => {
            const active = index === 0;
            return (
              <li key={step.n} className="flex min-w-0 flex-1 items-center gap-2">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    active
                      ? "bg-[#D97706] text-white shadow-sm"
                      : "bg-[#14532D]/10 text-[#14532D]"
                  }`}
                >
                  {active ? "✓" : step.n}
                </span>
                <span
                  className={`truncate text-xs font-bold sm:text-sm ${
                    active ? "text-[#D97706]" : "text-[#14532D]"
                  }`}
                >
                  {step.label}
                </span>
                {index < 2 && (
                  <span aria-hidden="true" className="mx-1 hidden h-px flex-1 bg-[#E5E5E2] sm:block" />
                )}
              </li>
            );
          })}
        </ol>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm font-semibold">
            {errorMessage}
          </div>
        )}

        {savedData?.hasSavedData && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold leading-6 text-emerald-900">
              اطلاعات قبلی شما (پروفایل یا سفارش پیشین) موجود است؛ می‌توانید فرم
              را با یک کلیک پر کنید.
            </p>
            <button
              type="button"
              onClick={applySavedData}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 text-sm font-bold text-white transition hover:bg-emerald-900"
            >
              <span aria-hidden="true">↺</span>
              پر کردن فرم با اطلاعات قبلی
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start"
        >
          {/* Right Column: Customer & Logistics Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Customer Info */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-sm">
                  ۱
                </span>
                مشخصات تحویل‌گیرنده و اطلاعات تجاری
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    نام و نام خانوادگی مسئول خرید *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="مثال: مهدی رضایی"
                    className="w-full h-12 px-4 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    شماره موبایل (جهت هماهنگی انبار) *
                  </label>
                  <input
                    type="tel"
                    name="userPhone"
                    required
                    value={formData.userPhone}
                    onChange={handleInputChange}
                    placeholder="09123456789"
                    className="w-full h-12 px-4 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    نام شرکت / کارخانه / بنکداری (اختیاری)
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="مثال: بازرگانی حبوبات پارس"
                    className="w-full h-12 px-4 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    کد ملی (اشخاص حقیقی)
                  </label>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="در صورت خرید شخص حقیقی"
                    className="w-full h-12 px-4 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    شناسه ملی / اقتصادی (اشخاص حقوقی)
                  </label>
                  <input
                    type="text"
                    name="economicId"
                    value={formData.economicId}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="در صورت خرید شرکتی"
                    className="w-full h-12 px-4 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-stone-500 sm:col-span-2">
                  وارد کردن کد ملی یا شناسه ملی/اقتصادی الزامی است؛ تکمیل هر دو
                  فیلد لازم نیست.
                </p>
              </div>
            </div>

            {/* Section 2: Destination & Address */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-sm">
                  ۲
                </span>
                استان، شهر و آدرس دقیق تخلیه بار
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    استان مقصد *
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-xl border border-stone-300 text-stone-900 text-sm bg-white focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  >
                    <option value="تهران">تهران</option>
                    <option value="اصفهان">اصفهان</option>
                    <option value="فارس">فارس</option>
                    <option value="خراسان رضوی">خراسان رضوی</option>
                    <option value="البرز">البرز</option>
                    <option value="آذربایجان شرقی">آذربایجان شرقی</option>
                    <option value="مازندران">مازندران</option>
                    <option value="خوزستان">خوزستان</option>
                    <option value="سایر استان‌ها">سایر استان‌ها</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    شهر مقصد *
                  </label>
                  <input
                    type="text"
                    name="destinationCity"
                    required
                    value={formData.destinationCity}
                    onChange={handleInputChange}
                    placeholder="مثال: شیراز"
                    className="w-full h-12 px-4 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  آدرس دقیق انبار یا بنکداری *
                </label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="مثال: میدان بار، غرفه ۱۲، انبار غله..."
                  className="w-full p-4 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-amber-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Section 3: Shipping & Logistics */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-sm">
                  ۳
                </span>
                روش ارسال و لجستیک بار
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label
                  className={`border rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all ${
                    formData.shippingType === "CARRIER"
                      ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-600"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingType"
                    value="CARRIER"
                    checked={formData.shippingType === "CARRIER"}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <span className="text-2xl mb-2">🛻</span>
                  <span className="font-bold text-stone-900 text-sm mb-1">
                    نیسان خود شرکت
                  </span>
                  <span className="text-xs text-stone-500">
                    ارسال با نیسان شرکت از انبار مرند
                  </span>
                </label>

                <label
                  className={`border rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all ${
                    formData.shippingType === "EXCLUSIVE_TRUCK"
                      ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-600"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingType"
                    value="EXCLUSIVE_TRUCK"
                    checked={formData.shippingType === "EXCLUSIVE_TRUCK"}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <span className="text-2xl mb-2">🚚</span>
                  <span className="font-bold text-stone-900 text-sm mb-1">
                    وانت / نیسان دربستی
                  </span>
                  <span className="text-xs text-stone-500">
                    تحویل در محل انبار شما
                  </span>
                </label>

                <label
                  className={`border rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all ${
                    formData.shippingType === "FACTORY_PICKUP"
                      ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-600"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingType"
                    value="FACTORY_PICKUP"
                    checked={formData.shippingType === "FACTORY_PICKUP"}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <span className="text-2xl mb-2">🏭</span>
                  <span className="font-bold text-stone-900 text-sm mb-1">
                    بارگیری درب انبار (مرند)
                  </span>
                  <span className="text-xs text-stone-500">
                    تحویل و بارگیری توسط خریدار
                  </span>
                </label>
              </div>

              {/* Conditional carrier name input */}
              {formData.shippingType === "EXCLUSIVE_TRUCK" && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    نام باربری / راننده (جهت هماهنگی تحویل)
                  </label>
                  <input
                    type="text"
                    name="carrierName"
                    value={formData.carrierName}
                    onChange={handleInputChange}
                    placeholder="مثال: باربری شوش - تعاونی خاوران"
                    className="w-full h-12 px-4 rounded-xl border border-stone-300 text-stone-900 text-sm focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
              )}

              {/* Smart Weight Recommendation Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-xl">💡</span>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {totalWeightKg > 15000 ? (
                    <span>
                      وزن بار شما بالای ۱۵ تن است. پیشنهاد می‌کنیم گزینه «وانت /
                      نیسان دربستی» را انتخاب کنید.
                    </span>
                  ) : totalWeightKg > 3000 ? (
                    <span>
                      وزن بار شما مناسب نیسان دربستی یا نیسان خود شرکت است.
                    </span>
                  ) : (
                    <span>
                      برای این تناژ، «وانت/نیسان دربستی» یا «بارگیری درب انبار
                      مرند» اقتصادی‌تر است.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Left Column: Sticky Summary & Submit */}
          <div className="lg:col-span-5 sticky top-6">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-extrabold text-stone-900 pb-4 border-b border-stone-100">
                خلاصه پیش‌فاکتور عمده
              </h2>

              {/* Items (cards at every size — no horizontal scroll) */}
              <ul className="space-y-3">
                {items.map((item) => {
                  const packageWeight = item.product?.packageWeightKg || 30;
                  return (
                    <li
                      key={item.productId}
                      className="rounded-xl border border-stone-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-stone-900">
                            {item.product?.title || "محصول حبوبات"}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-500">
                            {item.quantityBags.toLocaleString("fa-IR")} کیسه ×{" "}
                            {packageWeight.toLocaleString("fa-IR")} کیلو
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="shrink-0 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50"
                        >
                          حذف
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <span className="mb-1 block text-[11px] text-stone-500">
                            مقدار (کیلوگرم)
                          </span>
                          <QuantityControl
                            item={item}
                            onBags={updateBags}
                            onKg={updateRequestedKg}
                          />
                        </div>
                        <div className="text-left">
                          <span className="mb-1 block text-[11px] text-stone-500">
                            جمع کل
                          </span>
                          <span className="font-extrabold text-stone-900">
                            {item.totalPrice.toLocaleString("fa-IR")}{" "}
                            <span className="text-[11px] font-normal text-stone-500">
                              تومان
                            </span>
                          </span>
                        </div>
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-stone-100 pt-3 text-xs">
                        <div>
                          <dt className="text-stone-500">تناژ</dt>
                          <dd className="mt-0.5 font-semibold text-stone-800">
                            {item.totalKg.toLocaleString("fa-IR")} کیلو
                          </dd>
                        </div>
                        <div>
                          <dt className="text-stone-500">نرخ هر کیلو</dt>
                          <dd className="mt-0.5 font-semibold text-stone-800">
                            {item.unitPrice.toLocaleString("fa-IR")} تومان
                          </dd>
                        </div>
                      </dl>
                    </li>
                  );
                })}
              </ul>

              {/* Summary Stats */}
              <div className="bg-stone-900 text-white rounded-2xl p-5 space-y-3 shadow-lg">
                <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-stone-300">
                  <span>مجموع وزن بار:</span>
                  <span className="font-bold text-white">
                    {totalWeightKg.toLocaleString("fa-IR")} کیلو ({totalTons}{" "}
                    تن)
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-stone-300">
                  <span>تعداد کل کیسه‌ها:</span>
                  <span className="font-bold text-white">
                    {totalBags.toLocaleString("fa-IR")} گونی
                  </span>
                </div>
                <div className="pt-3 border-t border-stone-800 flex flex-wrap justify-between items-center gap-2">
                  <span className="text-sm font-bold text-amber-400">
                    جمع کل پیش‌فاکتور:
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold text-white">
                    {totalPrice.toLocaleString("fa-IR")}{" "}
                    <span className="text-xs font-normal text-stone-400">
                      تومان
                    </span>
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    در حال صدور پیش‌فاکتور رسمی...
                  </>
                ) : (
                  <>
                    <span>ثبت و صدور پیش‌فاکتور رسمی</span>
                    <svg
                      className="w-5 h-5 rtl:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
