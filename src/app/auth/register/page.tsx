"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUserAction, type AuthActionState } from "@/app/auth/actions";

const initialState: AuthActionState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerUserAction,
    initialState,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 py-10 sm:px-6 sm:py-12 lg:py-20">
      <section className="w-full max-w-md rounded-3xl border border-[#E5E5E2] bg-white p-6 shadow-xl sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-herb-600 text-white mb-4">
          <span className="text-xl font-black">ش</span>
        </div>
          <h2 className="text-center text-xl font-extrabold text-ink-900 sm:text-2xl">
          ثبت‌نام مشتری جدید
        </h2>
        <p className="mt-2 text-center text-sm leading-6 text-stone-600">
          با ثبت‌نام، سفارش‌ها و پیش‌فاکتورهای خود را پیگیری کنید.
        </p>
        <form action={formAction} className="mt-8 space-y-5">
          {state.error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {state.error}
            </p>
          )}
          <label className="block text-sm font-semibold text-ink-900">
            نام و نام خانوادگی
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="احمد امینی"
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 font-normal outline-none transition focus:border-herb-600 focus:ring-2 focus:ring-herb-100"
            />
          </label>
          <label className="block text-sm font-semibold text-ink-900">
            شماره تماس
            <input
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 font-normal outline-none transition focus:border-herb-600 focus:ring-2 focus:ring-herb-100 dir-ltr"
            />
          </label>
          <label className="block text-sm font-semibold text-ink-900">
            رمز عبور
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
              placeholder="حداقل ۶ کاراکتر"
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 font-normal outline-none transition focus:border-herb-600 focus:ring-2 focus:ring-herb-100"
            />
          </label>
          <label className="block text-sm font-semibold text-ink-900">
            تکرار رمز عبور
            <input
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
              placeholder="تکرار رمز عبور"
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 font-normal outline-none transition focus:border-herb-600 focus:ring-2 focus:ring-herb-100"
            />
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-herb-600 py-3.5 font-bold text-white transition hover:bg-herb-700 active:bg-herb-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shali-600 disabled:opacity-60"
          >
            {isPending ? "در حال ثبت‌نام..." : "ثبت‌نام و ورود"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-500">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-herb-600 hover:text-herb-700 underline underline-offset-4"
          >
            وارد شوید
          </Link>
        </p>
      </section>
    </main>
  );
}
