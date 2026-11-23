"use client";

import { useActionState, useState } from "react";
import { updatePaymentStatus } from "@/app/admin/actions";

interface PaymentRowActionsProps {
  paymentId: string;
  status: string;
  method: string;
  className?: string;
}

export default function PaymentRowActions({
  paymentId,
  status,
  method,
  className,
}: PaymentRowActionsProps) {
  const [state, formAction, isPending] = useActionState(updatePaymentStatus, {
    error: "",
    success: "",
  });
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const isFinal = status === "PAID" || status === "CLEARED";
  const isCancelled = status === "CANCELLED";
  const isCheque = method === "CHEQUE";

  const confirmLabel =
    method === "CHEQUE"
      ? "تأیید و وصول چک"
      : method === "BANK_TRANSFER"
        ? "تأیید واریز"
        : method === "CASH_ON_DELIVERY"
          ? "تأیید دریافت نقدی"
          : "تأیید پرداخت";

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        {!isFinal && !isCancelled && (
          <>
            <form action={formAction}>
              <input type="hidden" name="paymentId" value={paymentId} />
              <input type="hidden" name="action" value="CONFIRM" />
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {confirmLabel}
              </button>
            </form>
            <form action={formAction}>
              <input type="hidden" name="paymentId" value={paymentId} />
              <input type="hidden" name="action" value="REJECT" />
              <input type="hidden" name="rejectReason" value={rejectReason} />
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-800 disabled:opacity-50"
              >
                رد پرداخت
              </button>
            </form>
            {isCheque && (
              <form action={formAction}>
                <input type="hidden" name="paymentId" value={paymentId} />
                <input type="hidden" name="action" value="BOUNCE" />
                <input type="hidden" name="rejectReason" value={rejectReason} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-800 disabled:opacity-50"
                >
                  برگشتی
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => setShowReject((v) => !v)}
              className="rounded-lg border border-stone-300 px-2 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-100"
            >
              {showReject ? "بستن" : "دلیل"}
            </button>
          </>
        )}
      </div>

      {showReject && (
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={1}
          placeholder="دلیل رد/برگشت پرداخت (اختیاری)"
          className="w-full rounded-lg border border-stone-300 px-2 py-1 text-xs outline-none focus:border-amber-700"
        />
      )}

      {state?.error && (
        <p className="text-xs font-semibold text-rose-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-xs font-semibold text-emerald-700">{state.success}</p>
      )}
    </div>
  );
}