
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireAdmin();
  await connectToDatabase();

  const [users, orders] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).limit(300).lean(),
    Order.find({}).lean(),
  ]);

  const orderStats = new Map<
    string,
    { count: number; total: number; paid: number }
  >();
  for (const order of orders) {
    const key = order.userPhone;
    const current = orderStats.get(key) || { count: 0, total: 0, paid: 0 };
    current.count += 1;
    current.total += order.totalAmount;
    if (order.status === "PAID") current.paid += order.totalAmount;
    orderStats.set(key, current);
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl">مشتریان</h1>
          <p className="mt-1 text-sm text-stone-500">
            فهرست مشتریان، تعداد سفارش‌ها و مجموع خرید هر مشتری
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-full text-right text-sm sm:min-w-[700px]">
            <thead className="bg-stone-100 text-xs font-bold text-stone-600">
              <tr>
                <th className="p-3">نام مشتری</th>
                <th className="p-3">شماره تماس</th>
                <th className="p-3">تعداد سفارش</th>
                <th className="p-3">مجموع خرید</th>
                <th className="p-3">مبلغ پرداخت‌شده</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3">تاریخ عضویت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-stone-500" colSpan={7}>
                    مشتری‌ای ثبت نشده است.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const stats = orderStats.get(user.phone) || {
                    count: 0,
                    total: 0,
                    paid: 0,
                  };
                  return (
                    <tr key={user._id.toString()} className="hover:bg-stone-50/50">
                      <td className="p-3 font-bold text-stone-900">{user.name}</td>
                      <td className="p-3 text-stone-600" dir="ltr">
                        {user.phone}
                      </td>
                      <td className="p-3 font-semibold text-stone-900">
                        {stats.count.toLocaleString("fa-IR")}
                      </td>
                      <td className="p-3 text-stone-700">
                        {stats.total.toLocaleString("fa-IR")} تومان
                      </td>
                      <td className="p-3 font-bold text-emerald-700">
                        {stats.paid.toLocaleString("fa-IR")} تومان
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                            user.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {user.isActive ? "فعال" : "غیرفعال"}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-stone-500">
                        {new Intl.DateTimeFormat("fa-IR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }).format(new Date(user.createdAt))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Mobile card view */}
          <div className="xl:hidden space-y-3 p-4">
            {users.length === 0 ? (
              <div className="p-6 text-center text-stone-500">
                مشتری‌ای ثبت نشده است.
              </div>
            ) : (
              users.map((user) => {
                const stats = orderStats.get(user.phone) || {
                  count: 0,
                  total: 0,
                  paid: 0,
                };
                return (
                  <div
                    key={user._id.toString()}
                    className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-stone-900">{user.name}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                        user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                      }`}>
                        {user.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-stone-400 block">تماس</span>
                        <span className="text-stone-600" dir="ltr">{user.phone}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">تعداد سفارش</span>
                        <span className="font-semibold text-stone-900">{stats.count.toLocaleString("fa-IR")}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">مجموع خرید</span>
                        <span className="text-stone-700">{stats.total.toLocaleString("fa-IR")} تومان</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">پرداخت‌شده</span>
                        <span className="font-bold text-emerald-700">{stats.paid.toLocaleString("fa-IR")} تومان</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">عضویت</span>
                        <span className="text-stone-500 text-xs">
                          {new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(user.createdAt))}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}