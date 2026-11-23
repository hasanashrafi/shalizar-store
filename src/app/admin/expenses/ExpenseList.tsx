"use client";

interface Expense {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "PARTIAL";
  paidAmount: number;
  vendorName?: string;
  invoiceNumber?: string;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  TRANSPORT: "حمل و نقل",
  WAREHOUSE: "انبار",
  SALARY: "حقوق و دستمزد",
  UTILITIES: "آب/برق/گاز",
  MARKETING: "تبلیغات",
  MAINTENANCE: "تعمیرات",
  INSURANCE: "بیمه",
  TAX: "مالیات",
  OTHER: "سایر",
};

interface ExpenseListProps {
  expenses: Expense[];
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-x-auto">
      <table className="w-full min-w-full text-right text-sm sm:min-w-[700px]">
        <thead className="bg-stone-100 text-xs font-bold text-stone-600">
          <tr>
            <th className="p-3">تاریخ</th>
            <th className="p-3">عنوان</th>
            <th className="p-3">دسته‌بندی</th>
            <th className="p-3">مبلغ</th>
            <th className="p-3">روش پرداخت</th>
            <th className="p-3">وضعیت</th>
            <th className="p-3">وندور</th>
            <th className="p-3">فاکتور</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {expenses.length === 0 ? (
            <tr>
              <td className="p-6 text-center text-stone-500" colSpan={8}>
                هزینه‌ای ثبت نشده است.
              </td>
            </tr>
          ) : (
            expenses.map((e) => (
              <tr key={e._id} className="hover:bg-stone-50/50">
                <td className="p-3 text-stone-500 whitespace-nowrap">
                  {new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(e.createdAt))}
                </td>
                <td className="p-3 font-bold text-stone-900">{e.title}</td>
                <td className="p-3 text-stone-600">{CATEGORY_LABELS[e.category]}</td>
                <td className="p-3 font-bold text-red-700">{e.amount.toLocaleString("fa-IR")}</td>
                <td className="p-3 text-stone-600">{e.paymentMethod}</td>
                <td className="p-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                    e.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-800" :
                    e.paymentStatus === "PARTIAL" ? "bg-amber-100 text-amber-800" :
                    "bg-stone-100 text-stone-700"
                  }`}>
                    {e.paymentStatus === "PAID" ? "پرداخت‌شده" : e.paymentStatus === "PARTIAL" ? "مخلوط" : "در انتظار"}
                  </span>
                </td>
                <td className="p-3 text-stone-600">{e.vendorName || "-"}</td>
                <td className="p-3 text-stone-600">{e.invoiceNumber || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Mobile card view */}
      <div className="xl:hidden space-y-3 p-4">
        {expenses.map((e) => (
          <div key={e._id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-stone-900">{e.title}</span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                e.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-800" :
                e.paymentStatus === "PARTIAL" ? "bg-amber-100 text-amber-800" :
                "bg-stone-100 text-stone-700"
              }`}>
                {e.paymentStatus === "PAID" ? "پرداخت‌شده" : e.paymentStatus === "PARTIAL" ? "مخلوط" : "در انتظار"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-stone-400 block">تاریخ</span>
                <span className="text-stone-600">
                  {new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(e.createdAt))}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">مبلغ</span>
                <span className="font-bold text-red-700">{e.amount.toLocaleString("fa-IR")}</span>
              </div>
              <div>
                <span className="text-stone-400 block">دسته‌بندی</span>
                <span className="text-stone-600">{CATEGORY_LABELS[e.category]}</span>
              </div>
              <div>
                <span className="text-stone-400 block">روش پرداخت</span>
                <span className="text-stone-600">{e.paymentMethod}</span>
              </div>
              <div>
                <span className="text-stone-400 block">وندور</span>
                <span className="text-stone-600">{e.vendorName || "-"}</span>
              </div>
              <div>
                <span className="text-stone-400 block">فاکتور</span>
                <span className="text-stone-600">{e.invoiceNumber || "-"}</span>
              </div>
            </div>
          </div>
        ))}
        {expenses.length === 0 && (
          <div className="p-6 text-center text-stone-500">
            هزینه‌ای ثبت نشده است.
          </div>
        )}
      </div>
    </div>
  );
}