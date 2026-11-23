import { connectToDatabase } from "@/lib/mongodb";
import CashFlow, { type CashFlowType } from "@/models/CashFlow";


export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<CashFlowType, string> = {
  SALE: "فروش",
  PURCHASE: "خرید",
  EXPENSE: "هزینه",
  RECEIPT: "دریافت",
  PAYMENT: "پرداخت",
  ADJUSTMENT: "تنظیم",
};

async function getCashFlow() {
  await connectToDatabase();
  return CashFlow.find({}).sort({ date: -1 }).limit(200).lean();
}

async function getSummary() {
  await connectToDatabase();
  const pipeline = [
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ];
  return CashFlow.aggregate(pipeline);
}

export default async function AdminCashFlowPage() {
  const [cashFlow, summary] = await Promise.all([getCashFlow(), getSummary()]);

  const totals = summary.reduce((acc, item) => {
    acc[item._id] = item.total;
    return acc;
  }, {} as Record<string, number>);

  const sales = totals.SALE || 0;
  const purchases = totals.PURCHASE || 0;
  const expenses = totals.EXPENSE || 0;
  const receipts = totals.RECEIPT || 0;
  const payments = totals.PAYMENT || 0;
  const netCashFlow = sales + receipts + payments + purchases + expenses;

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl">جریان نقدینگی</h1>
          <p className="mt-1 text-sm text-stone-500">نمایش تمام تراکنش‌های مالی و خلاصه نقدینگی</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">فروشهای خالص</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-700">{sales.toLocaleString("fa-IR")} تومان</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">خریدهای مواد اولیه</p>
            <p className="mt-2 text-2xl font-extrabold text-amber-700">{(purchases).toLocaleString("fa-IR")} تومان</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">هزینه‌های عملیاتی</p>
            <p className="mt-2 text-2xl font-extrabold text-red-700">{(expenses).toLocaleString("fa-IR")} تومان</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">دریافت‌های دیگر</p>
            <p className="mt-2 text-2xl font-extrabold text-blue-700">{(receipts + payments).toLocaleString("fa-IR")} تومان</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">نقدینگی خالص</p>
            <p className={`mt-2 text-2xl font-extrabold ${netCashFlow >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {netCashFlow.toLocaleString("fa-IR")} تومان
            </p>
          </div>
        </div>

        {/* Cash Flow Table */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full min-w-full text-right text-sm sm:min-w-[700px]">
            <thead className="bg-stone-100 text-xs font-bold text-stone-600">
              <tr>
                <th className="p-3">تاریخ</th>
                <th className="p-3">نوع</th>
                <th className="p-3">مبلغ</th>
                <th className="p-3">توضیح</th>
                <th className="p-3">دسته‌بندی</th>
                <th className="p-3">روش پرداخت</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3">مرجع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {cashFlow.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-stone-500" colSpan={8}>
                    تراکنشی ثبت نشده است.
                  </td>
                </tr>
              ) : (
                cashFlow.map((c) => (
                  <tr key={c._id.toString()} className="hover:bg-stone-50/50">
                    <td className="p-3 text-stone-500 whitespace-nowrap">
                      {new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(c.date))}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                        c.type === "SALE" ? "bg-emerald-100 text-emerald-800" :
                        c.type === "PURCHASE" ? "bg-amber-100 text-amber-800" :
                        c.type === "EXPENSE" ? "bg-red-100 text-red-800" :
                        c.type === "RECEIPT" ? "bg-blue-100 text-blue-800" :
                        c.type === "PAYMENT" ? "bg-violet-100 text-violet-800" :
                        "bg-stone-100 text-stone-700"
                      }`}>
                        {TYPE_LABELS[c.type]}
                      </span>
                    </td>
                    <td className={`p-3 font-bold ${c.amount >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {c.amount >= 0 ? "+" : ""}{c.amount.toLocaleString("fa-IR")}
                    </td>
                    <td className="p-3 text-stone-600 max-w-xs truncate">{c.description}</td>
                    <td className="p-3 text-stone-600">{c.category || "-"}</td>
                    <td className="p-3 text-stone-600">{c.paymentMethod || "-"}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                        c.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" :
                        c.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                        "bg-rose-100 text-rose-800"
                      }`}>
                        {c.status === "COMPLETED" ? "تأییدشده" : c.status === "PENDING" ? "در انتظار" : "لغو"}
                      </span>
                    </td>
                    <td className="p-3 text-stone-500 text-xs font-mono">
                      {c.referenceId ? c.referenceId.toString().slice(-8).toUpperCase() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile card view */}
          <div className="xl:hidden space-y-3 p-4">
            {cashFlow.length === 0 ? (
              <div className="p-6 text-center text-stone-500">
                تراکنشی ثبت نشده است.
              </div>
            ) : (
              cashFlow.map((c) => (
                <div key={c._id.toString()} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                      c.type === "SALE" ? "bg-emerald-100 text-emerald-800" :
                      c.type === "PURCHASE" ? "bg-amber-100 text-amber-800" :
                      c.type === "EXPENSE" ? "bg-red-100 text-red-800" :
                      c.type === "RECEIPT" ? "bg-blue-100 text-blue-800" :
                      c.type === "PAYMENT" ? "bg-violet-100 text-violet-800" :
                      "bg-stone-100 text-stone-700"
                    }`}>
                      {TYPE_LABELS[c.type]}
                    </span>
                    <span className={`font-bold ${c.amount >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {c.amount >= 0 ? "+" : ""}{c.amount.toLocaleString("fa-IR")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-stone-400 block">تاریخ</span>
                      <span className="text-stone-600">
                        {new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(c.date))}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">توضیح</span>
                      <span className="text-stone-600 max-w-xs truncate">{c.description}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">دسته‌بندی</span>
                      <span className="text-stone-600">{c.category || "-"}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">روش پرداخت</span>
                      <span className="text-stone-600">{c.paymentMethod || "-"}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">وضعیت</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                        c.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" :
                        c.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                        "bg-rose-100 text-rose-800"
                      }`}>
                        {c.status === "COMPLETED" ? "تأییدشده" : c.status === "PENDING" ? "در انتظار" : "لغو"}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">مرجع</span>
                      <span className="text-stone-500 text-xs font-mono">
                        {c.referenceId ? c.referenceId.toString().slice(-8).toUpperCase() : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}