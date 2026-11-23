"use client";

import { useActionState, useState } from "react";
import {
  payOrderOnline,
  submitChequePayment,
  submitBankTransfer,
  selectCashOnDelivery,
  resetPaymentSelection,
  cancelOrder,
  type PaymentActionState,
} from "@/app/orders/actions";
import PersianDatePicker from "@/components/ui/PersianDatePicker";

interface OrderPaymentSectionProps {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
}

const inputClass =
  "mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100";

const paymentStatusLabels: Record<string, string> = {
  UNPAID: "پرداخت نشده",
  AWAITING_CLEARING: "در انتظار تأیید پرداخت",
  PAID: "پرداخت شده",
  REJECTED: "پرداخت رد شده",
};

const paymentStatusClasses: Record<string, string> = {
  UNPAID: "bg-stone-100 text-stone-700",
  AWAITING_CLEARING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
};

const methodLabels: Record<string, string> = {
  ONLINE: "پرداخت اینترنتی",
  BANK_TRANSFER: "کارت به کارت / واریز بانکی",
  CHEQUE: "چک",
  CASH_ON_DELIVERY: "پرداخت نقدی در محل تحویل",
};

export default function OrderPaymentSection({
  orderId,
  orderNumber,
  totalAmount,
  status,
  paymentStatus,
  paymentMethod,
}: OrderPaymentSectionProps) {
  const [mode, setMode] = useState<"menu" | "cheque" | "transfer">("menu");

  const [onlineState, onlineAction, onlinePending] = useActionState<
    PaymentActionState,
    FormData
  >(payOrderOnline, {});
  const [chequeState, chequeAction, chequePending] = useActionState<
    PaymentActionState,
    FormData
  >(submitChequePayment, {});
  const [transferState, transferAction, transferPending] = useActionState<
    PaymentActionState,
    FormData
  >(submitBankTransfer, {});
  const [cashState, cashAction, cashPending] = useActionState<
    PaymentActionState,
    FormData
  >(selectCashOnDelivery, {});
  const [resetState, resetAction, resetPending] = useActionState<
    PaymentActionState,
    FormData
  >(resetPaymentSelection, {});

  const isCancelled = status === "CANCELLED";
  const isPaid = paymentStatus === "PAID" || status === "PAID";
  const isAwaitingClearing = paymentStatus === "AWAITING_CLEARING";
  const isCashSelected = !isPaid && paymentMethod === "CASH_ON_DELIVERY";

  return (
    <section className="no-print rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-stone-900">پرداخت سفارش</h2>
          <p className="mt-1 text-xs text-stone-500">
            شماره سفارش {orderNumber} — مبلغ قابل پرداخت:{" "}
            <span className="font-bold text-stone-800">
              {totalAmount.toLocaleString("fa-IR")} تومان
            </span>
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
            paymentStatusClasses[paymentStatus] ?? "bg-stone-100 text-stone-700"
          }`}
        >
          {paymentStatusLabels[paymentStatus] ?? paymentStatus}
        </span>
      </div>

      {isPaid ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800">
          این سفارش پرداخت شده است. رسید پرداخت در بخش پرداخت‌های حساب شما ثبت شده
          است.
        </div>
      ) : isCancelled ? (
        <div className="rounded-2xl bg-stone-100 border border-stone-200 p-4 text-sm font-semibold text-stone-600">
          این سفارش لغو شده است و قابل پرداخت نیست.
        </div>
      ) : (
        <>
          {isAwaitingClearing && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm font-semibold text-amber-900">
              روش پرداخت «{methodLabels[paymentMethod ?? ""] ?? "پرداخت"}» ثبت شده و
              در انتظار تأیید و وصول توسط مدیر است. وضعیت نهایی پس از بررسی اعلام
              می‌شود.
              <form action={resetAction} className="mt-3">
                <input type="hidden" name="orderId" value={orderId} />
                <button
                  type="submit"
                  disabled={resetPending}
                  className="rounded-lg border border-amber-400 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                >
                  {resetPending ? "در حال تغییر..." : "تغییر روش پرداخت"}
                </button>
              </form>
              {resetState.error && (
                <p className="mt-2 text-xs font-semibold text-rose-700">
                  {resetState.error}
                </p>
              )}
            </div>
          )}

          {isCashSelected && (
            <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 text-sm font-semibold text-sky-900">
              «پرداخت نقدی در محل تحویل» انتخاب شده است. مبلغ سفارش هنگام تحویل بار
              به‌صورت نقدی پرداخت می‌شود.
              <form action={resetAction} className="mt-3">
                <input type="hidden" name="orderId" value={orderId} />
                <button
                  type="submit"
                  disabled={resetPending}
                  className="rounded-lg border border-sky-400 px-3 py-1.5 text-xs font-bold text-sky-900 hover:bg-sky-100 disabled:opacity-60"
                >
                  {resetPending ? "در حال تغییر..." : "تغییر روش پرداخت"}
                </button>
              </form>
              {resetState.error && (
                <p className="mt-2 text-xs font-semibold text-rose-700">
                  {resetState.error}
                </p>
              )}
            </div>
          )}

          {!isAwaitingClearing && !isCashSelected && (
            <>
              {/* Action feedback */}
              {onlineState.error && (
                <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm font-semibold text-rose-800">
                  {onlineState.error}
                </p>
              )}
              {onlineState.success && (
                <p className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-semibold text-emerald-800">
                  {onlineState.success}
                </p>
              )}
              {cashState.error && (
                <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm font-semibold text-rose-800">
                  {cashState.error}
                </p>
              )}

              {mode === "menu" && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Online payment */}
                  <form action={onlineAction} className="contents">
                    <input type="hidden" name="orderId" value={orderId} />
                    <button
                      type="submit"
                      disabled={onlinePending}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center transition hover:bg-emerald-100 disabled:opacity-60"
                    >
                      <span className="text-xl">💳</span>
                      <span className="font-bold text-emerald-900">
                        پرداخت اینترنتی
                      </span>
                      <span className="text-xs text-emerald-700">
                        پرداخت آنی و نهایی شدن سفارش
                      </span>
                      <span className="mt-1 text-xs font-bold text-emerald-800">
                        {onlinePending ? "در حال اتصال..." : "پرداخت و نهایی‌سازی"}
                      </span>
                    </button>
                  </form>

                  {/* Bank transfer */}
                  <button
                    type="button"
                    onClick={() => setMode("transfer")}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-center transition hover:bg-sky-100"
                  >
                    <span className="text-2xl">🏦</span>
                    <span className="font-bold text-sky-900">
                      کارت به کارت / واریز
                    </span>
                    <span className="text-xs text-sky-700">
                      ثبت اطلاعات واریز و انتظار برای تأیید
                    </span>
                    <span className="mt-1 text-xs font-bold text-sky-800">
                      ثبت واریز
                    </span>
                  </button>

                  {/* Cheque payment */}
                  <button
                    type="button"
                    onClick={() => setMode("cheque")}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center transition hover:bg-amber-100"
                  >
                    <span className="text-2xl">🧾</span>
                    <span className="font-bold text-amber-900">پرداخت با چک</span>
                    <span className="text-xs text-amber-700">
                      ثبت اطلاعات چک و انتظار برای وصول
                    </span>
                    <span className="mt-1 text-xs font-bold text-amber-800">
                      ثبت چک
                    </span>
                  </button>

                  {/* Cash on delivery */}
                  <form action={cashAction} className="contents">
                    <input type="hidden" name="orderId" value={orderId} />
                    <button
                      type="submit"
                      disabled={cashPending}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 p-5 text-center transition hover:bg-violet-100 disabled:opacity-60"
                    >
                      <span className="text-2xl">💵</span>
                      <span className="font-bold text-violet-900">
                        پرداخت نقدی در محل
                      </span>
                      <span className="text-xs text-violet-700">
                        پرداخت هنگام تحویل بار
                      </span>
                      <span className="mt-1 text-xs font-bold text-violet-800">
                        {cashPending ? "در حال ثبت..." : "انتخاب این روش"}
                      </span>
                    </button>
                  </form>
                </div>
              )}

              {mode === "transfer" && (
                <form
                  action={transferAction}
                  className="space-y-4 rounded-2xl border border-sky-200 bg-sky-50/40 p-5"
                >
                  <input type="hidden" name="orderId" value={orderId} />
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-900">
                      اطلاعات واریز بانکی / کارت به کارت
                    </h3>
                    <button
                      type="button"
                      onClick={() => setMode("menu")}
                      className="text-xs font-bold text-stone-500 hover:text-stone-700"
                    >
                      بازگشت
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold">
                      نام واریزکننده *
                      <input name="depositorName" required placeholder="مثال: مهدی رضایی" className={inputClass} />
                    </label>
                    <label className="text-sm font-semibold">
                      نام بانک *
                      <input name="bankName" required placeholder="مثال: بانک ملت" className={inputClass} />
                    </label>
                    <label className="text-sm font-semibold">
                      شماره کارت / حساب مقصد *
                      <input name="cardNumber" required inputMode="numeric" placeholder="شماره کارت یا شبا" className={inputClass} />
                    </label>
                    <label className="text-sm font-semibold">
                      شماره پیگیری / رسید (اختیاری)
                      <input name="trackingRef" placeholder="مثال: ۱۲۳۴۵۶۷۸۹" className={inputClass} />
                    </label>
                    <label className="text-sm font-semibold">
                      تاریخ واریز
                      <PersianDatePicker name="depositDate" className="mt-1" placeholder="تاریخ واریز" />
                    </label>
                    <label className="text-sm font-semibold">
                      مبلغ واریزی (تومان)
                      <input
                        name="amount"
                        type="number"
                        min="1"
                        defaultValue={totalAmount}
                        className={inputClass}
                      />
                    </label>
                    <label className="text-sm font-semibold sm:col-span-2">
                      تصویر رسید واریز (اختیاری)
                      <input
                        type="file"
                        name="receipt"
                        accept="image/*"
                        className="mt-1 w-full text-xs text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-700 file:px-3 file:py-2 file:text-xs file:text-white hover:file:bg-sky-800"
                      />
                      <span className="mt-1 block text-[11px] font-normal text-stone-500">
                        حجم تصویر حداکثر ۲ مگابایت باشد.
                      </span>
                    </label>
                  </div>

                  {transferState.error && (
                    <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm font-semibold text-rose-800">
                      {transferState.error}
                    </p>
                  )}
                  {transferState.success && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-semibold text-emerald-800">
                      {transferState.success}
                    </div>
                  )}
                  {transferState.warning && (
                    <div className="rounded-xl bg-amber-100 border border-amber-300 p-3 text-sm font-bold text-amber-900">
                      ⚠️ {transferState.warning}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={transferPending}
                    className="w-full rounded-xl bg-sky-700 py-3 font-bold text-white hover:bg-sky-800 disabled:opacity-60"
                  >
                    {transferPending ? "در حال ثبت..." : "ثبت اطلاعات واریز"}
                  </button>
                </form>
              )}

              {mode === "cheque" && (
                <form
                  action={chequeAction}
                  className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/40 p-5"
                >
                  <input type="hidden" name="orderId" value={orderId} />
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-900">اطلاعات چک</h3>
                    <button
                      type="button"
                      onClick={() => setMode("menu")}
                      className="text-xs font-bold text-stone-500 hover:text-stone-700"
                    >
                      بازگشت
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold">
                      نام صاحب حساب *
                      <input name="accountHolder" required placeholder="مثال: مهدی رضایی" className={inputClass} />
                    </label>
                    <label className="text-sm font-semibold">
                      نام بانک *
                      <input name="bankName" required placeholder="مثال: بانک ملت" className={inputClass} />
                    </label>
                    <label className="text-sm font-semibold">
                      نام شعبه
                      <input name="branchName" placeholder="مثال: شعبه ولیعصر" className={inputClass} />
                    </label>
                    <label className="text-sm font-semibold">
                      شماره حساب
                      <input name="accountNumber" placeholder="اختیاری" className={inputClass} />
                    </label>
                    <label className="text-sm font-semibold">
                      شماره چک *
                      <input name="chequeNumber" required placeholder="مثال: ۱۲۳۴۵۶" className={inputClass} />
                    </label>
                    <label className="text-sm font-semibold">
                      سریال چک
                      <input name="chequeSerial" placeholder="اختیاری" className={inputClass} />
                    </label>
                    <label className="text-sm font-semibold">
                      تاریخ صدور
                      <PersianDatePicker name="issueDate" className="mt-1" placeholder="تاریخ صدور چک" />
                    </label>
                    <label className="text-sm font-semibold">
                      تاریخ سررسید
                      <PersianDatePicker name="dueDate" className="mt-1" placeholder="تاریخ سررسید چک" />
                    </label>
                    <label className="text-sm font-semibold sm:col-span-2">
                      مبلغ چک (تومان)
                      <input
                        name="amount"
                        type="number"
                        min="1"
                        defaultValue={totalAmount}
                        className={inputClass}
                      />
                    </label>
                  </div>

                  {chequeState.error && (
                    <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm font-semibold text-rose-800">
                      {chequeState.error}
                    </p>
                  )}
                  {chequeState.success && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-semibold text-emerald-800">
                      {chequeState.success}
                    </div>
                  )}
                  {chequeState.warning && (
                    <div className="rounded-xl bg-amber-100 border border-amber-300 p-3 text-sm font-bold text-amber-900">
                      ⚠️ {chequeState.warning}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={chequePending}
                    className="w-full rounded-xl bg-amber-700 py-3 font-bold text-white hover:bg-amber-800 disabled:opacity-60"
                  >
                    {chequePending ? "در حال ثبت..." : "ثبت چک و ارسال به مدیر"}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Cancel order */}
          <form
            action={cancelOrder}
            onSubmit={(e) => {
              if (
                !window.confirm(
                  "آیا از حذف (لغو) این سفارش مطمئن هستید؟ این عمل قابل بازگشت نیست.",
                )
              ) {
                e.preventDefault();
              }
            }}
            className="pt-2 border-t border-stone-100"
          >
            <input type="hidden" name="orderId" value={orderId} />
            <button
              type="submit"
              className="rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50"
            >
              حذف / لغو سفارش
            </button>
            <p className="mt-2 text-xs text-stone-500">
              سفارش‌های پرداخت‌شده قابل حذف نیستند. با لغو سفارش، موجودی به انبار
              بازگردانده می‌شود.
            </p>
          </form>
        </>
      )}
    </section>
  );
}