"use client";

import { useActionState } from "react";
import {
  updateUserProfileAction,
  type ProfileActionState,
} from "@/app/dashboard/actions";
import { PROVINCES, SHIPPING_TYPES } from "@/lib/constants";

const initialState: ProfileActionState = {};

export interface ProfileFormUser {
  name: string;
  phone: string;
  email: string | null;
  companyName: string | null;
  nationalId: string | null;
  economicId: string | null;
  province: string | null;
  destinationCity: string | null;
  address: string | null;
  carrierName: string | null;
  preferredShippingType: string | null;
}

export default function ProfileForm({
  user,
  onboarding = false,
}: {
  user: ProfileFormUser;
  onboarding?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    updateUserProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {onboarding && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
          <span className="font-bold">خوش آمدید! </span>
          برای اینکه در خریدهای بعدی مجبور نباشید فرم را دوباره پر کنید،
          اطلاعات شخصی، فروشگاه، آدرس و راه تماس خود را اینجا ذخیره کنید.
        </div>
      )}

      {state.error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"
        >
          {state.success}
        </p>
      )}

      {/* اطلاعات شخصی */}
      <section className="rounded-3xl border border-[#E5E5E2] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-5 text-base font-extrabold text-[#1F2937]">
          اطلاعات شخصی و تماس
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-stone-700">
            نام و نام خانوادگی *
            <input
              name="name"
              required
              defaultValue={user.name}
              autoComplete="name"
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-xs font-bold text-stone-700">
            شماره موبایل *
            <input
              name="phone"
              type="tel"
              required
              defaultValue={user.phone}
              autoComplete="tel"
              dir="ltr"
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 text-left text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-xs font-bold text-stone-700 sm:col-span-2">
            ایمیل (اختیاری)
            <input
              name="email"
              type="email"
              defaultValue={user.email ?? ""}
              autoComplete="email"
              dir="ltr"
              placeholder="example@mail.com"
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 text-left text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>
      </section>

      {/* اطلاعات فروشگاه */}
      <section className="rounded-3xl border border-[#E5E5E2] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-5 text-base font-extrabold text-[#1F2937]">
          اطلاعات فروشگاه / کسب‌وکار
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-stone-700 sm:col-span-2">
            نام شرکت / کارخانه / بنکداری (اختیاری)
            <input
              name="companyName"
              defaultValue={user.companyName ?? ""}
              placeholder="مثال: بازرگانی حبوبات پارس"
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-xs font-bold text-stone-700">
            کد ملی (اشخاص حقیقی)
            <input
              name="nationalId"
              defaultValue={user.nationalId ?? ""}
              inputMode="numeric"
              maxLength={10}
              placeholder="۱۰ رقم"
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-xs font-bold text-stone-700">
            شناسه ملی / اقتصادی (اشخاص حقوقی)
            <input
              name="economicId"
              defaultValue={user.economicId ?? ""}
              inputMode="numeric"
              maxLength={14}
              placeholder="۱۰ تا ۱۴ رقم"
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>
      </section>

      {/* آدرس و ارسال */}
      <section className="rounded-3xl border border-[#E5E5E2] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-5 text-base font-extrabold text-[#1F2937]">
          آدرس تحویل بار و روش ارسال
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-stone-700">
            استان
            <select
              name="province"
              defaultValue={user.province ?? ""}
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">انتخاب استان</option>
              {PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold text-stone-700">
            شهر
            <input
              name="destinationCity"
              defaultValue={user.destinationCity ?? ""}
              placeholder="مثال: شیراز"
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-xs font-bold text-stone-700 sm:col-span-2">
            آدرس دقیق انبار یا فروشگاه
            <textarea
              name="address"
              rows={3}
              defaultValue={user.address ?? ""}
              placeholder="مثال: میدان بار، غرفه ۱۲، انبار غله..."
              className="mt-2 w-full rounded-xl border border-stone-300 p-4 text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-xs font-bold text-stone-700">
            روش ارسال پیش‌فرض
            <select
              name="preferredShippingType"
              defaultValue={user.preferredShippingType ?? ""}
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">انتخاب روش</option>
              {SHIPPING_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold text-stone-700">
            نام باربری (در صورت ارسال با باربری)
            <input
              name="carrierName"
              defaultValue={user.carrierName ?? ""}
              placeholder="مثال: باربری شوش - تعاونی خاوران"
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 text-sm font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-800 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "در حال ذخیره..." : "ذخیره اطلاعات پروفایل"}
      </button>
    </form>
  );
}