import { connectToDatabase } from "@/lib/mongodb";
import Expense from "@/models/Expense";

import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";

export const dynamic = "force-dynamic";

async function getExpenses() {
  await connectToDatabase();
  const expenses = await Expense.find({}).sort({ createdAt: -1 }).limit(100).lean();
  return expenses.map((e) => ({
    _id: e._id.toString(),
    title: e.title,
    description: e.description,
    amount: e.amount,
    category: e.category,
    paymentMethod: e.paymentMethod,
    paymentStatus: e.paymentStatus,
    paidAmount: e.paidAmount,
    vendorName: e.vendorName,
    invoiceNumber: e.invoiceNumber,
    createdAt: e.createdAt.toISOString(),
  }));
}

export default async function AdminExpensesPage() {
  const expenses = await getExpenses();

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl">مدیریت هزینه‌ها</h1>
          <p className="mt-1 text-sm text-stone-500">ثبت و پیگیری هزینه‌های عملیاتی</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-1">
            <ExpenseForm />
          </section>
          <section className="lg:col-span-2">
            <ExpenseList expenses={expenses} />
          </section>
        </div>
      </div>
    </main>
  );
}