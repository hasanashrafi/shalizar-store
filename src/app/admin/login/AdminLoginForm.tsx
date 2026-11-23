"use client";

import { useActionState } from "react";
import { loginAdmin, type AdminActionState } from "@/app/admin/actions";

const initialState: AdminActionState = {};

export default function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAdmin,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <label className="block text-sm font-bold text-stone-700">
        نام کاربری
        <input
          name="username"
          required
          autoComplete="username"
          className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 font-normal outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
        />
      </label>
      <label className="block text-sm font-bold text-stone-700">
        رمز عبور
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 h-12 w-full rounded-xl border border-stone-300 px-4 font-normal outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
        />
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-amber-700 py-3 font-bold text-white hover:bg-amber-800 disabled:opacity-60"
      >
        {isPending ? "در حال بررسی..." : "ورود امن"}
      </button>
    </form>
  );
}
