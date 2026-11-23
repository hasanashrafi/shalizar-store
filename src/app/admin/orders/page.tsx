import Link from "next/link";

import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ORDER_STATUSES, type OrderStatus } from "@/models/Order";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { updateOrderStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "در انتظار تأیید",
  APPROVED: "تأییدشده",
  PAID: "پرداخت‌شده",
  CANCELLED: "لغوشده",
};

const shippingLabels = {
  CARRIER: "باربری",
  EXCLUSIVE_TRUCK: "خودروی دربستی",
  FACTORY_PICKUP: "تحویل از انبار",
} as const;

interface OrderItem {
  productId: { toString(): string };
  requestedKg: number;
  totalPrice: number;
}

interface OrderWithItems {
  items: OrderItem[];
  totalAmount: number;
}

// Calculate profit for an order
async function calculateOrderProfit(order: OrderWithItems): Promise<number> {
  let totalCost = 0;
  for (const item of order.items) {
    const product = await Product.findById(item.productId).lean();
    if (product && product.purchasePricePerKg && product.purchasePricePerKg > 0) {
      totalCost += product.purchasePricePerKg * item.requestedKg;
    } else if (product) {
      // Fallback: estimate from first tier if no purchase price
      totalCost += (product.tiers[0]?.pricePerKg || 0) * 0.7 * item.requestedKg;
    }
  }
  return order.totalAmount - totalCost;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  await requireAdmin();
  const { status: requestedStatus } = await searchParams;
  const status = ORDER_STATUSES.includes(requestedStatus as OrderStatus)
    ? (requestedStatus as OrderStatus)
    : undefined;

  await connectToDatabase();
  const orders = await Order.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  // Calculate profit for each order
  const ordersWithProfit = await Promise.all(
    orders.map(async (order) => {
      const profit = await calculateOrderProfit(order);
      return { ...order, profit };
    })
  );

  const filters: Array<{ value: string; label: string }> = [
    { value: "", label: "همه" },
    ...ORDER_STATUSES.map((value) => ({
      value,
      label: statusLabels[value],
    })),
  ];

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl">
              مدیریت سفارش‌ها
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              حداکثر ۱۰۰ سفارش اخیر؛ وضعیت را پس از بررسی سفارش به‌روزرسانی کنید.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="فیلتر وضعیت سفارش">
            {filters.map((filter) => (
              <Link
                key={filter.value || "all"}
                href={
                  filter.value
                    ? `/admin/orders?status=${filter.value}`
                    : "/admin/orders"
                }
                aria-current={
                  (status ?? "") === filter.value ? "page" : undefined
                }
                className={`rounded-full border px-3 py-2 text-sm font-semibold ${
                  (status ?? "") === filter.value
                    ? "border-amber-800 bg-amber-800 text-white"
                    : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-full text-right text-sm sm:min-w-[800px]">
            <thead className="bg-stone-100 text-xs font-bold text-stone-600">
              <tr>
                <th className="p-3">سفارش / تاریخ</th>
                <th className="p-3">خریدار و تماس</th>
                <th className="p-3">بار / تناژ</th>
                <th className="p-3">مبلغ کل</th>
                <th className="p-3">سود تخمینی</th>
                <th className="p-3">ارسال</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3">اقدام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {ordersWithProfit.map((order) => (
                <tr key={order._id.toString()} className="align-top">
                  <td className="p-3">
                    <Link
                      href={`/orders/${order._id.toString()}`}
                      className="font-bold text-amber-800 hover:underline"
                    >
                      #{order._id.toString().slice(-8).toUpperCase()}
                    </Link>
                    <time className="mt-1 block text-xs text-stone-500">
                      {order.createdAt.toLocaleDateString("fa-IR")}
                    </time>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-stone-900">
                      {order.companyName || order.customerName}
                    </span>
                    <span className="mt-1 block text-xs text-stone-500">
                      {order.userPhone}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold">
                      {order.items.length} قلم
                    </span>
                    <span className="mt-1 block text-xs text-stone-500">
                      {order.totalWeightKg.toLocaleString("fa-IR")} کیلوگرم
                    </span>
                  </td>
                  <td className="p-3 font-bold">
                    {order.totalAmount.toLocaleString("fa-IR")} تومان
                  </td>
                  <td className="p-3">
                    <span className={`font-bold ${order.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {order.profit.toLocaleString("fa-IR")} تومان
                    </span>
                  </td>
                  <td className="p-3">
                    {shippingLabels[order.shippingType]}
                    {order.warehouseName && (
                      <span className="mt-1 block text-xs text-stone-500">
                        {order.warehouseName}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700">
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="p-3">
                    <form action={updateOrderStatus} className="flex gap-1.5">
                      <input
                        type="hidden"
                        name="orderId"
                        value={order._id.toString()}
                      />
                      <select
                        name="status"
                        defaultValue={order.status}
                        aria-label="وضعیت جدید سفارش"
                        className="rounded-lg border border-stone-300 bg-white px-2 py-2 text-xs"
                      >
                        {ORDER_STATUSES.map((itemStatus) => (
                          <option key={itemStatus} value={itemStatus}>
                            {statusLabels[itemStatus]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg bg-stone-900 px-2.5 py-2 text-xs font-bold text-white hover:bg-stone-700"
                      >
                        ذخیره
                      </button>
                      <Link
                        href={`/orders/${order._id.toString()}/print`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-stone-300 px-2.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                      >
                        چاپ
                      </Link>
                    </form>
                  </td>
                </tr>
              ))}
              {ordersWithProfit.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-stone-500">
                    سفارشی با این وضعیت پیدا نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="xl:hidden space-y-3 mt-4">
          {ordersWithProfit.map((order) => (
            <div
              key={order._id.toString()}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Link
                    href={`/orders/${order._id.toString()}`}
                    className="font-bold text-amber-800 hover:underline"
                  >
                    #{order._id.toString().slice(-8).toUpperCase()}
                  </Link>
                  <time className="text-xs text-stone-500">
                    {order.createdAt.toLocaleDateString("fa-IR")}
                  </time>
                </div>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-700">
                  {statusLabels[order.status]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-xs text-stone-400 block">خریدار</span>
                  <span className="font-bold text-stone-900">
                    {order.companyName || order.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block">تماس</span>
                  <span className="text-stone-600">{order.userPhone}</span>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block">بار / تناژ</span>
                  <span className="text-stone-600">
                    {order.items.length} قلم · {order.totalWeightKg.toLocaleString("fa-IR")} کگ
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block">مبلغ کل</span>
                  <span className="font-bold text-emerald-700">
                    {order.totalAmount.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block">سود تخمینی</span>
                  <span className={`font-bold ${order.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {order.profit.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block">ارسال</span>
                  <span className="text-stone-600">{shippingLabels[order.shippingType]}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={updateOrderStatus} className="flex-1 min-w-[120px] flex gap-1.5">
                  <input
                    type="hidden"
                    name="orderId"
                    value={order._id.toString()}
                  />
                  <select
                    name="status"
                    defaultValue={order.status}
                    aria-label="وضعیت جدید سفارش"
                    className="flex-1 rounded-lg border border-stone-300 bg-white px-2 py-2 text-xs"
                  >
                    {ORDER_STATUSES.map((itemStatus) => (
                      <option key={itemStatus} value={itemStatus}>
                        {statusLabels[itemStatus]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-stone-900 px-2.5 py-2 text-xs font-bold text-white hover:bg-stone-700"
                  >
                    ذخیره
                  </button>
                </form>
                <Link
                  href={`/orders/${order._id.toString()}/print`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-stone-300 px-2.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  چاپ
                </Link>
              </div>
            </div>
          ))}
          {ordersWithProfit.length === 0 && (
            <div className="p-12 text-center text-stone-500">
              سفارشی با این وضعیت پیدا نشد.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
