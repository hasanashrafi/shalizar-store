
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import Payment, {
  PAYMENT_STATUSES,
  type PaymentStatus,
} from "@/models/Payment";
import PaymentRowActions from "./PaymentRowActions";

export const dynamic = "force-dynamic";

interface AdminPaymentsPageProps {
  searchParams: Promise<{ status?: string }>;
}

const statusLabels: Record<string, string> = {
  PENDING: "در انتظار وصول",
  PAID: "پرداخت‌شده",
  CLEARED: "تسویه‌شده",
  REJECTED: "رد شده",
  BOUNCED: "برگشتی",
  CANCELLED: "لغو شده",
};

const statusClasses: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  CLEARED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  BOUNCED: "bg-rose-100 text-rose-800",
  CANCELLED: "bg-stone-100 text-stone-600",
};

const methodLabels: Record<string, string> = {
  ONLINE: "پرداخت اینترنتی",
  BANK_TRANSFER: "کارت به کارت / واریز",
  CHEQUE: "چک",
  CASH_ON_DELIVERY: "نقدی در محل",
};

export default async function AdminPaymentsPage({
  searchParams,
}: AdminPaymentsPageProps) {
  await requireAdmin();
  const { status: requestedStatus } = await searchParams;
  const status: PaymentStatus | undefined =
    requestedStatus &&
      PAYMENT_STATUSES.includes(requestedStatus as PaymentStatus)
      ? (requestedStatus as PaymentStatus)
      : undefined;

  await connectToDatabase();
  const payments = await Payment.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const filters: Array<{ value: string; label: string }> = [
    { value: "", label: "همه" },
    { value: "PENDING", label: "در انتظار وصول" },
    { value: "CLEARED", label: "تسویه‌شده" },
    { value: "REJECTED", label: "رد شده" },
    { value: "BOUNCED", label: "برگشتی" },
  ];

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl">
              مدیریت پرداخت‌ها
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              پرداخت‌های اینترنتی، کارت به کارت، چک و نقدی ثبت‌شده توسط مشتریان
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <a
                key={filter.value || "all"}
                href={
                  filter.value
                    ? `/admin/payments?status=${filter.value}`
                    : "/admin/payments"
                }
                className={`rounded-full border px-3 py-2 text-sm font-semibold ${
                  (status ?? "") === filter.value
                    ? "border-amber-800 bg-amber-800 text-white"
                    : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                }`}
              >
                {filter.label}
              </a>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-full text-right text-sm sm:min-w-[700px]">
            <thead className="bg-stone-100 text-xs font-bold text-stone-600">
              <tr>
                <th className="p-3">تاریخ</th>
                <th className="p-3">سفارش</th>
                <th className="p-3">مشتری</th>
                <th className="p-3">روش</th>
                <th className="p-3">مبلغ</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {payments.length === 0 ? (
                <tr>
                  <td className="p-12 text-center text-stone-500" colSpan={7}>
                    پرداختی ثبت نشده است.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id.toString()} className="align-top hover:bg-stone-50/50">
                    <td className="p-3 text-xs text-stone-500 whitespace-nowrap">
                      {new Intl.DateTimeFormat("fa-IR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(payment.createdAt))}
                    </td>
                    <td className="p-3">
                      <a
                        href={`/orders/${payment.orderId.toString()}`}
                        className="font-mono font-bold text-amber-800 hover:underline"
                      >
                        #{payment.orderNumber}
                      </a>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-stone-900">
                        {payment.customerName}
                      </span>
                      <span className="mt-1 block text-xs text-stone-500">
                        {payment.userPhone}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-bold text-stone-700">
                        {methodLabels[payment.method]}
                      </span>
                    </td>
                    <td className="p-3 font-bold">
                      {payment.amount.toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                          statusClasses[payment.status] ??
                          "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {statusLabels[payment.status]}
                      </span>
                    </td>
                    <td className="p-3">
                      <PaymentRowActions
                        paymentId={payment._id.toString()}
                        status={payment.status}
                        method={payment.method}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile card view */}
          <div className="xl:hidden space-y-3 p-4">
            {payments.length === 0 ? (
              <div className="p-6 text-center text-stone-500">
                پرداختی ثبت نشده است.
              </div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment._id.toString()}
                  className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-amber-800">
                      #{payment.orderNumber}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                        statusClasses[payment.status] ??
                        "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {statusLabels[payment.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-stone-400 block">تاریخ</span>
                      <span className="text-stone-600">
                        {new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(payment.createdAt))}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">مشتری</span>
                      <span className="font-bold text-stone-900">{payment.customerName}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">تماس</span>
                      <span className="text-stone-600">{payment.userPhone}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">روش</span>
                      <span className="text-stone-600">{methodLabels[payment.method]}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">مبلغ</span>
                      <span className="font-bold text-stone-900">{payment.amount.toLocaleString("fa-IR")} تومان</span>
                    </div>
                  </div>
                  <PaymentRowActions
                    paymentId={payment._id.toString()}
                    status={payment.status}
                    method={payment.method}
                    className="flex flex-col sm:flex-row gap-2 w-full"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}