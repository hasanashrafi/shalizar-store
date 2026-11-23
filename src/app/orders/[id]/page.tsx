import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getUserSessionUserId, getUserById } from "@/lib/user-auth";
import { hasAdminSession } from "@/lib/admin-auth";
import Order from "@/models/Order";
import PrintButton from "@/components/orders/PrintButton";
import OrderPaymentSection from "@/components/orders/OrderPaymentSection";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getOrderById(id: string) {
  if (!isValidObjectId(id)) return null;

  await connectToDatabase();
  const order = await Order.findById(id).lean();

  if (!order) return null;

  return {
    ...order,
    id: order._id.toString(),
  };
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const resolvedParams = await params;

  const isAdmin = await hasAdminSession();
  const userId = await getUserSessionUserId();

  let userPhone: string | null = null;
  if (userId) {
    await connectToDatabase();
    const user = await getUserById(userId);
    if (user && user.isActive) {
      userPhone = user.phone;
    }
  }

  const order = await getOrderById(resolvedParams.id);
  if (!order) {
    notFound();
  }

  const isOwner = userPhone != null && order.userPhone === userPhone;
  const canView = isAdmin || isOwner;

  if (!canView) {
    if (!userId) redirect("/auth/login");
    notFound();
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalTons = (order.totalWeightKg / 1000).toFixed(2);

  const statusMap: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "در انتظار تأیید انبار",
      className: "bg-amber-100 text-amber-800 border-amber-300",
    },
    APPROVED: {
      label: "در انتظار واریز بیعانه",
      className: "bg-blue-100 text-blue-800 border-blue-300",
    },
    PAID: {
      label: "پرداخت‌شده",
      className: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    CANCELLED: {
      label: "لغو شده",
      className: "bg-red-100 text-red-800 border-red-300",
    },
  };

  const currentStatus = statusMap[order.status] || {
    label: order.status,
    className: "bg-stone-100 text-stone-800",
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-6 px-4 sm:px-6 sm:py-10 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Print Actions (Hidden on Print) */}
        <div className="no-print flex items-center justify-between">
          <Link
            href="/products"
            className="text-sm font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
          >
            <span>← بازگشت به کاتالوگ محصولات</span>
          </Link>

          <div className="flex items-center gap-3">
            <PrintButton orderId={order.id} />
          </div>
        </div>

        {/* Main Official Invoice Container */}
        <div className="invoice-card bg-white rounded-3xl border border-stone-200 shadow-xl p-4 space-y-6 sm:p-8 sm:space-y-8 lg:p-10">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 sm:pb-8 border-b border-stone-200 gap-3 sm:gap-4">
            <div>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                پیش‌فاکتور رسمی فروش عمده
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900">
                پلتفرم بازرگانی و عمده‌فروشی شالیزار
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                مرکز پخش مستقیم حبوبات درجه یک ایرانی و وارداتی
              </p>
            </div>

            <div className="text-right sm:text-left space-y-1 bg-stone-50 p-4 rounded-2xl border border-stone-100 w-full sm:w-auto">
              <div className="text-xs text-stone-500">
                شماره سفارش:{" "}
                <span className="font-mono font-bold text-stone-900">
                  {order.id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-stone-500">
                تاریخ صدور:{" "}
                <span className="font-semibold text-stone-900">
                  {orderDate}
                </span>
              </div>
              <div className="pt-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${currentStatus.className}`}
                >
                  {currentStatus.label}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900">
            <span className="text-lg">⚠️</span>
            <span>
              این پیش‌فاکتور بر مبنای اطلاعات ثبت‌شده صادر شده است. نهایی‌شدن
              قیمت، موجودی و هزینه حمل منوط به تأیید فروشنده است.
            </span>
          </div>

          {/* Customer & Seller Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            {/* Seller Box */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2">
              <h3 className="font-extrabold text-stone-900 text-base mb-3 border-b pb-2">
                فروشنده (تأمین‌کننده)
              </h3>
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">نام شرکت:</span>{" "}
                <span className="font-bold text-stone-900">
                  بازرگانی شالیزار
                </span>
              </div>
              <p className="text-stone-600">
                هماهنگی محل بارگیری و روش تسویه پس از بررسی سفارش انجام می‌شود.
              </p>
            </div>

            {/* Buyer Box */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2">
              <h3 className="font-extrabold text-stone-900 text-base mb-3 border-b pb-2">
                خریدار (مشتری حقوقی/حقیقی)
              </h3>
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">نام تحویل‌گیرنده:</span>{" "}
                <span className="font-bold text-stone-900">
                  {order.customerName}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">شماره موبایل:</span>{" "}
                <span className="font-bold text-stone-900">
                  {order.userPhone}
                </span>
              </div>
              {order.companyName && (
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">نام مجموعه:</span>{" "}
                  <span className="font-bold text-stone-900">
                    {order.companyName}
                  </span>
                </div>
              )}
              {order.nationalId && (
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">کد ملی:</span>{" "}
                  <span className="font-bold text-stone-900">
                    {order.nationalId}
                  </span>
                </div>
              )}
              {order.economicId && (
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">شناسه ملی / اقتصادی:</span>{" "}
                  <span className="font-bold text-stone-900">
                    {order.economicId}
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">شهر و مقصد:</span>{" "}
                <span className="font-bold text-stone-900">
                  {order.destinationCity}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="shrink-0 text-stone-500">آدرس تحویل:</span>{" "}
                <span className="min-w-0 break-words text-left font-bold text-stone-900">
                  {order.deliveryAddress}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-stone-500">نوع لجستیک:</span>{" "}
                <span className="font-bold text-amber-800">
                  {order.warehouseName}
                </span>
              </div>
              {order.notes && (
                <div className="flex justify-between gap-4">
                  <span className="shrink-0 text-stone-500">توضیحات:</span>
                  <span className="text-left font-bold text-stone-900">
                    {order.notes}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <h3 className="text-base font-extrabold text-stone-900 mb-4">
              اقلام سفارش‌شده
            </h3>
            <div className="border border-stone-200 rounded-2xl overflow-x-auto text-xs sm:text-sm">
              <table className="w-full min-w-[680px] text-right border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                    <th className="p-3.5">ردیف</th>
                    <th className="p-3.5">نام محصول</th>
                    <th className="p-3.5">کالیبر و مبدأ</th>
                    <th className="p-3.5">بسته‌بندی</th>
                    <th className="p-3.5">تعداد کیسه</th>
                    <th className="p-3.5">وزن کل (kg)</th>
                    <th className="p-3.5">نرخ واحد (تومان)</th>
                    <th className="p-3.5 text-left">مبلغ کل (تومان)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {order.items.map((item, index) => (
                    <tr
                      key={item.productId.toString()}
                      className="hover:bg-stone-50/50"
                    >
                      <td className="p-3.5 font-bold text-stone-500">
                        {index + 1}
                      </td>
                      <td className="p-3.5 font-bold text-stone-900">
                        {item.productTitle}
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {item.caliber} - {item.origin}
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {item.packageWeightKg} کیلویی
                      </td>
                      <td className="p-3.5 font-semibold text-stone-900">
                        {item.bagsCount.toLocaleString("fa-IR")} کیسه
                      </td>
                      <td className="p-3.5 font-semibold text-stone-900">
                        {item.requestedKg.toLocaleString("fa-IR")} کیلو
                      </td>
                      <td className="p-3.5 font-semibold text-stone-900">
                        {item.unitPrice.toLocaleString("fa-IR")}
                      </td>
                      <td className="p-3.5 font-extrabold text-stone-900 text-left">
                        {item.totalPrice.toLocaleString("fa-IR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice total and delivery conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="space-y-3 border-b sm:border-b-0 sm:border-l border-stone-800 pb-6 sm:pb-0 sm:pl-6">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                شرایط تحویل و تسویه
              </h4>
              <div className="text-xs leading-6 text-stone-300">
                <p>
                  روش حمل انتخاب‌شده:{" "}
                  {order.shippingType === "CARRIER"
                    ? "نیسان خود شرکت"
                    : order.shippingType === "EXCLUSIVE_TRUCK"
                      ? "وانت / نیسان دربستی"
                      : "بارگیری درب انبار (مرند)"}
                </p>
                {order.warehouseName && <p>باربری: {order.warehouseName}</p>}
                <p>
                  هزینه حمل در مبلغ کالا محاسبه نشده و شرایط تسویه پس از تأیید
                  فروشنده اعلام می‌شود.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-right sm:pr-2">
              <div className="flex justify-between items-center text-xs text-stone-300">
                <span>وزن ناخالص بار:</span>
                <span className="font-bold text-white">
                  {order.totalWeightKg.toLocaleString("fa-IR")} کیلو (
                  {totalTons} تن)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-300">
                <span>مجموع اقلام:</span>
                <span className="font-bold text-white">
                  {order.items.length} نوع محصول
                </span>
              </div>
              <div className="pt-3 border-t border-stone-800 flex justify-between items-center">
                <span className="text-sm font-bold text-amber-400">
                  مبلغ کل پیش‌فاکتور:
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  {order.totalAmount.toLocaleString("fa-IR")}{" "}
                  <span className="text-xs font-normal text-stone-400">
                    تومان
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print pt-4 flex flex-col sm:flex-row items-center justify-end gap-4">
            <Link
              href="/products"
              className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-6 py-3.5 rounded-2xl text-center transition-all"
            >
              بازگشت به کاتالوگ محصولات
            </Link>
          </div>
        </div>

        {/* Payment section (order owner / customer) */}
        {isOwner && (
          <OrderPaymentSection
            orderId={order.id}
            orderNumber={order.id.slice(-8).toUpperCase()}
            totalAmount={order.totalAmount}
            status={order.status}
            paymentStatus={order.paymentStatus ?? "UNPAID"}
            paymentMethod={order.paymentMethod ?? null}
          />
        )}
      </div>
    </div>
  );
}
