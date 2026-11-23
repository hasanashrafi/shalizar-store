import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import Purchase from "@/models/Purchase";
import CashFlow from "@/models/CashFlow";
import Product from "@/models/Product";
import Expense from "@/models/Expense";


export const dynamic = "force-dynamic";

interface OrderItem {
  productId: { toString(): string };
  bagsCount: number;
  totalPrice: number;
  requestedKg: number;
}

async function getAnalytics() {
  await connectToDatabase();

  const [
    orders,
    purchases,
    products,
    expenses,
    cashFlowPurchases,
    cashFlowExpenses,
  ] = await Promise.all([
    Order.find({}).lean(),
    Purchase.find({}).lean(),
    Product.find({}).lean(),
    Expense.find({}).lean(),
    CashFlow.aggregate([
      { $match: { type: "PURCHASE" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    CashFlow.aggregate([
      { $match: { type: "EXPENSE" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);

  // Revenue/profit is calculated from paid orders only (real sales)
  const completedOrders = orders.filter((o) => o.status === "PAID");

  // Build product cost map from purchasePricePerKg
  const productCostMap = new Map<string, number>();
  products.forEach((p) => {
    if (p.purchasePricePerKg && p.purchasePricePerKg > 0) {
      productCostMap.set(p._id.toString(), p.purchasePricePerKg);
    }
  });

  // Calculate revenue and cost from completed orders only
  let totalRevenue = 0;
  let totalCostOfGoods = 0;
  const productSales = new Map<
    string,
    { quantity: number; revenue: number; cost: number }
  >();

  completedOrders.forEach((order) => {
    totalRevenue += order.totalAmount;
    (order.items as OrderItem[]).forEach((item) => {
      const key = item.productId.toString();
      const existing = productSales.get(key) || {
        quantity: 0,
        revenue: 0,
        cost: 0,
      };
      existing.quantity += item.bagsCount;
      existing.revenue += item.totalPrice;

      const costPerKg = productCostMap.get(key);
      if (costPerKg) {
        existing.cost += costPerKg * item.requestedKg;
      } else {
        const purchase = purchases.find((p) => p.productId.toString() === key);
        if (purchase) {
          existing.cost += purchase.unitCost * item.bagsCount;
        }
      }
      productSales.set(key, existing);
      totalCostOfGoods += existing.cost - (productSales.get(key)?.cost || 0) + (costPerKg ? costPerKg * item.requestedKg : 0);
    });
  });

  // Recalculate totalCostOfGoods correctly
  totalCostOfGoods = 0;
  productSales.forEach((data) => {
    totalCostOfGoods += data.cost;
  });

  const totalPurchases = Math.abs(cashFlowPurchases[0]?.total || 0);
  const totalExpenses = Math.abs(cashFlowExpenses[0]?.total || 0);
  // Also add expenses from Expense model
  const expensesTotal = expenses.reduce((sum, e) => sum + (e.paymentStatus === "PAID" ? e.amount : 0), 0);
  
  const grossProfit = totalRevenue - totalCostOfGoods;
  const netProfit = grossProfit - totalExpenses - expensesTotal;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  const topProducts = Array.from(productSales.entries())
    .map(([productId, data]) => {
      const product = products.find((p) => p._id.toString() === productId);
      return {
        title: product?.title || "نامشخص",
        quantity: data.quantity,
        revenue: data.revenue,
        cost: data.cost || 0,
        profit: data.revenue - (data.cost || 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Monthly sales AND profit trend (last 6 months)
  const monthlyData = new Map<
    string,
    { revenue: number; cost: number; profit: number }
  >();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
    });
    monthlyData.set(key, { revenue: 0, cost: 0, profit: 0 });
  }

  completedOrders.forEach((order) => {
    const date = new Date(order.createdAt);
    const key = date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
    });
    const existing = monthlyData.get(key) || { revenue: 0, cost: 0, profit: 0 };
    existing.revenue += order.totalAmount;
    
    // Calculate cost for this order
    let orderCost = 0;
    (order.items as OrderItem[]).forEach((item) => {
      const costPerKg = productCostMap.get(item.productId.toString());
      if (costPerKg) {
        orderCost += costPerKg * item.requestedKg;
      }
    });
    existing.cost += orderCost;
    existing.profit += order.totalAmount - orderCost;
    monthlyData.set(key, existing);
  });

  return {
    totals: {
      totalRevenue,
      totalCostOfGoods,
      totalPurchases,
      totalExpenses: totalExpenses + expensesTotal,
      grossProfit,
      netProfit,
      profitMargin,
      ordersCount: orders.length,
      completedOrdersCount: completedOrders.length,
      paidOrdersCount: orders.filter((o) => o.status === "PAID").length,
      pendingOrdersCount: orders.filter(
        (o) => o.status === "PENDING" || o.status === "APPROVED",
      ).length,
    },
    topProducts,
    monthlyData: Array.from(monthlyData.entries()),
  };
}

export default async function AdminAnalyticsPage() {
  const { totals, topProducts, monthlyData } = await getAnalytics();

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl">داشبورد تحلیلی</h1>
          <p className="mt-1 text-sm text-stone-500">نمای کلی فروش، سود، ضرر و عملکرد محصولات</p>
        </div>

        {/* KPI Cards - Row 1 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">درآمد کل (سفارشات تکمیل‌شده)</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-700">{totals.totalRevenue.toLocaleString("fa-IR")} تومان</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">بهای تمام‌شده کالای فروخته</p>
            <p className="mt-2 text-2xl font-extrabold text-amber-700">{totals.totalCostOfGoods.toLocaleString("fa-IR")} تومان</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">هزینه‌های عملیاتی</p>
            <p className="mt-2 text-2xl font-extrabold text-red-700">{totals.totalExpenses.toLocaleString("fa-IR")} تومان</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">سود خالص</p>
            <p className={`mt-2 text-2xl font-extrabold ${totals.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {totals.netProfit.toLocaleString("fa-IR")} تومان
            </p>
          </div>
        </div>

        {/* KPI Cards - Row 2 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">سود ناخالص</p>
            <p className="mt-2 text-2xl font-extrabold text-blue-700">{totals.grossProfit.toLocaleString("fa-IR")} تومان</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">حاشیه سود</p>
            <p className="mt-2 text-2xl font-extrabold text-violet-700">{totals.profitMargin}%</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">سفارش‌های پرداخت‌شده</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-700">{totals.completedOrdersCount.toLocaleString("fa-IR")}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">در انتظار پرداخت / تأیید</p>
            <p className="mt-2 text-2xl font-extrabold text-amber-700">{totals.pendingOrdersCount.toLocaleString("fa-IR")}</p>
          </div>
        </div>

        {/* Monthly Revenue & Profit Chart */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm mb-6">
          <h3 className="text-lg font-bold text-stone-900 mb-4">روند درآمد و سود ۶ ماه اخیر</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-right text-sm sm:min-w-[600px]">
              <thead className="bg-stone-100 text-xs font-bold text-stone-600">
                <tr>
                  <th className="p-3">ماه</th>
                  <th className="p-3">درآمد (تومان)</th>
                  <th className="p-3">بهای تمام‌شده (تومان)</th>
                  <th className="p-3">سود (تومان)</th>
                  <th className="p-3">حاشیه سود</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {monthlyData.map(([month, data]) => {
                  const margin = data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={month} className="hover:bg-stone-50/50">
                      <td className="p-3 font-semibold text-stone-900">{month}</td>
                      <td className="p-3 text-emerald-700 font-bold">{data.revenue.toLocaleString("fa-IR")}</td>
                      <td className="p-3 text-amber-700 font-bold">{data.cost.toLocaleString("fa-IR")}</td>
                      <td className={`p-3 font-bold ${data.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {data.profit.toLocaleString("fa-IR")}
                      </td>
                      <td className={`p-3 font-bold ${Number(margin) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {margin}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile card view */}
          <div className="xl:hidden space-y-3 mt-4 p-4">
            {monthlyData.map(([month, data]) => {
              const margin = data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : "0.0";
              return (
                <div key={month} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-stone-900">{month}</span>
                    <span className={`font-bold ${Number(margin) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{margin}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-stone-400 block">درآمد</span>
                      <span className="text-emerald-700 font-bold">{data.revenue.toLocaleString("fa-IR")}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">بهای تمام‌شده</span>
                      <span className="text-amber-700 font-bold">{data.cost.toLocaleString("fa-IR")}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">سود</span>
                      <span className={`font-bold ${data.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {data.profit.toLocaleString("fa-IR")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-stone-900 mb-4">پرفروش‌ترین محصولات (بر اساس درآمد)</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full text-right text-sm sm:min-w-[700px]">
              <thead className="bg-stone-100 text-xs font-bold text-stone-600">
                <tr>
                  <th className="p-3">محصول</th>
                  <th className="p-3">تعداد فروش (کیسه)</th>
                  <th className="p-3">درآمد</th>
                  <th className="p-3">بهای تمام‌شده</th>
                  <th className="p-3">سود تخمینی</th>
                  <th className="p-3">حاشیه سود</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {topProducts.length === 0 ? (
                  <tr>
                    <td className="p-6 text-center text-stone-500" colSpan={6}>
                      داده‌ای برای نمایش وجود ندارد.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, i) => {
                    const margin = p.revenue > 0 ? ((p.profit / p.revenue) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={i} className="hover:bg-stone-50/50">
                        <td className="p-3 font-bold text-stone-900">{p.title}</td>
                        <td className="p-3 text-stone-600">{p.quantity.toLocaleString("fa-IR")}</td>
                        <td className="p-3 font-bold text-emerald-700">{p.revenue.toLocaleString("fa-IR")}</td>
                        <td className="p-3 text-red-700">{p.cost.toLocaleString("fa-IR")}</td>
                        <td className={`p-3 font-bold ${p.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                          {p.profit.toLocaleString("fa-IR")}
                        </td>
                        <td className={`p-3 font-bold ${Number(margin) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                          {margin}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile card view */}
          <div className="xl:hidden space-y-3 mt-4 p-4">
            {topProducts.map((p, i) => {
              const margin = p.revenue > 0 ? ((p.profit / p.revenue) * 100).toFixed(1) : "0.0";
              return (
                <div key={i} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-stone-900">{p.title}</span>
                    <span className={`font-bold ${Number(margin) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{margin}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-stone-400 block">تعداد فروش</span>
                      <span className="text-stone-600">{p.quantity.toLocaleString("fa-IR")} کیسه</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">درآمد</span>
                      <span className="text-emerald-700 font-bold">{p.revenue.toLocaleString("fa-IR")}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">بهای تمام‌شده</span>
                      <span className="text-red-700">{p.cost.toLocaleString("fa-IR")}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">سود تخمینی</span>
                      <span className={`font-bold ${p.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {p.profit.toLocaleString("fa-IR")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {topProducts.length === 0 && (
              <div className="p-6 text-center text-stone-500">
                داده‌ای برای نمایش وجود ندارد.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}