import Link from "next/link";
import { getUserById, getUserSessionUserId } from "@/lib/user-auth";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

const statusMeta: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: { label: "در انتظار تأیید", className: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "تأیید شده", className: "bg-emerald-100 text-emerald-800" },
  PAID: { label: "پرداخت شده", className: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "لغو شده", className: "bg-rose-100 text-rose-800" },
};

const paymentStatusMeta: Record<
  string,
  { label: string; className: string }
> = {
  UNPAID: { label: "پرداخت نشده", className: "bg-rose-100 text-rose-700" },
  AWAITING_CLEARING: {
    label: "در انتظار تأیید پرداخت",
    className: "bg-amber-100 text-amber-800",
  },
  PAID: { label: "پرداخت شده", className: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "پرداخت رد شده", className: "bg-rose-100 text-rose-700" },
};

const methodLabels: Record<string, string> = {
  ONLINE: "پرداخت اینترنتی",
  BANK_TRANSFER: "کارت به کارت / واریز",
  CHEQUE: "چک",
  CASH_ON_DELIVERY: "نقدی در محل تحویل",
};

export default async function CustomerDashboardPage() {
  await connectToDatabase();
  const userId = await getUserSessionUserId();
  const user = userId ? await getUserById(userId) : null;

  const orders = await Order.find({ userPhone: user?.phone ?? "" })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return (
    <main>
      <div className="mb-6">
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900">
          پیگیری خرید عمده
        </span>
            <h1 className="mt-3 text-xl font-black text-[#1C1917] sm:text-2xl">
          سفارش‌ها و پیش‌فاکتورها
        </h1>
        <p className="mt-2 text-sm leading-7 text-stone-600">
          وضعیت سفارش‌های ثبت‌شده و برگه‌های پیش‌فاکتور در این بخش قابل پیگیری
          است. برای مشاهدهٔ جزئیات، پرداخت یا حذف سفارش روی آن کلیک کنید.
        </p>
      </div>

      {orders.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-[#E7E5E4] bg-white p-8 text-center shadow-sm sm:p-12">
          <span
            aria-hidden="true"
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl sm:h-16 sm:w-16 sm:text-3xl"
          >
            📦
          </span>
          <h2 className="mt-5 text-lg font-bold text-[#1C1917]">
            هنوز سفارشی ثبت نشده است
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
            اولین سفارش عمدهٔ خود را از کاتالوگ ثبت کنید.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-600 px-5 text-sm font-bold text-white transition hover:bg-amber-700"
            >
              مشاهده کاتالوگ
            </Link>
            <Link
              href="/cart"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#E7E5E4] bg-white px-5 text-sm font-bold text-[#1C1917] transition hover:bg-stone-50"
            >
              رفتن به پیش‌فاکتور
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* جدول دسکتاپ */}
          <div className="hidden overflow-hidden rounded-3xl border border-[#E7E5E4] bg-white shadow-sm md:block">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#FAF8F5] text-xs font-bold text-stone-600">
                <tr>
                  <th className="p-4">شماره سفارش</th>
                  <th className="p-4">تاریخ</th>
                  <th className="p-4">اقلام بار</th>
                  <th className="p-4">مبلغ کل</th>
                  <th className="p-4">وضعیت سفارش</th>
                  <th className="p-4">پرداخت</th>
                  <th className="p-4">جزئیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {orders.map((order) => {
                  const meta = statusMeta[order.status] ?? statusMeta.PENDING;
                  const payMeta =
                    paymentStatusMeta[order.paymentStatus] ??
                    paymentStatusMeta.UNPAID;
                  const canPay =
                    order.paymentStatus !== "PAID" &&
                    order.status !== "PAID" &&
                    order.status !== "CANCELLED";
                  return (
                    <tr key={order._id.toString()} className="transition-colors hover:bg-stone-50/60">
                      <td className="p-4">
                        <Link
                          href={`/orders/${order._id.toString()}`}
                          className="font-mono font-bold text-emerald-900 hover:underline"
                        >
                          #{order._id.toString().slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="p-4 text-stone-600">
                        {new Intl.DateTimeFormat("fa-IR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }).format(new Date(order.createdAt))}
                      </td>
                      <td className="p-4 text-stone-600">
                        {order.items.length} قلم ·{" "}
                        {order.totalWeightKg.toLocaleString("fa-IR")} کیلو
                      </td>
                      <td className="p-4 font-bold text-amber-700">
                        {order.totalAmount.toLocaleString("fa-IR")} تومان
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.className}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${payMeta.className}`}>
                          {payMeta.label}
                        </span>
                        {order.paymentMethod && (
                          <span className="mt-1 block text-[11px] text-stone-500">
                            {methodLabels[order.paymentMethod] ?? order.paymentMethod}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/orders/${order._id.toString()}`}
                          className={`inline-flex min-h-9 items-center rounded-lg px-3 py-1.5 text-xs font-bold text-white transition ${
                            canPay
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-emerald-900 hover:bg-emerald-800"
                          }`}
                        >
                          {canPay ? "مشاهده و پرداخت" : "مشاهده فاکتور"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* کارت‌های موبایل */}
          <div className="space-y-3 md:hidden">
            {orders.map((order) => {
              const meta = statusMeta[order.status] ?? statusMeta.PENDING;
              const payMeta =
                paymentStatusMeta[order.paymentStatus] ??
                paymentStatusMeta.UNPAID;
              return (
                <Link
                  key={order._id.toString()}
                  href={`/orders/${order._id.toString()}`}
                  className="block rounded-2xl border border-[#E7E5E4] bg-white p-4 shadow-sm transition active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-bold text-emerald-900">
                        #{order._id.toString().slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {new Intl.DateTimeFormat("fa-IR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }).format(new Date(order.createdAt))}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.className}`}>
                        {meta.label}
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${payMeta.className}`}>
                        {payMeta.label}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-end justify-between border-t border-[#E7E5E4] pt-3">
                    <span className="text-xs text-stone-500">
                      {order.items.length} قلم ·{" "}
                      {order.totalWeightKg.toLocaleString("fa-IR")} کیلو
                    </span>
                    <span className="text-sm font-bold text-amber-700">
                      {order.totalAmount.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}