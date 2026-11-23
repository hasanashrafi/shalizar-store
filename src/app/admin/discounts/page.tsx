import { connectToDatabase } from "@/lib/mongodb";
import Discount from "@/models/Discount";

import DiscountForm from "./DiscountForm";
import DiscountList from "./DiscountList";

export const dynamic = "force-dynamic";

async function getDiscounts() {
  await connectToDatabase();
  const discounts = await Discount.find({}).sort({ createdAt: -1 }).lean();
  return discounts.map((d) => ({
    _id: d._id.toString(),
    name: d.name,
    description: d.description,
    type: d.type,
    scope: d.scope,
    productIds: d.productIds?.map((id) => id.toString()),
    category: d.category,
    tiers: d.tiers,
    startDate: d.startDate.toISOString(),
    endDate: d.endDate?.toISOString() || null,
    isActive: d.isActive,
    usageLimit: d.usageLimit,
    usageCount: d.usageCount,
    createdAt: d.createdAt.toISOString(),
  }));
}

export default async function AdminDiscountsPage() {
  const discounts = await getDiscounts();

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-stone-900 sm:text-2xl">مدیریت تخفیف‌ها</h1>
          <p className="mt-1 text-sm text-stone-500">تعریف تخفیف‌های حجمی، درصدی و پلکانی</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-1">
            <DiscountForm />
          </section>
          <section className="lg:col-span-2">
            <DiscountList discounts={discounts} />
          </section>
        </div>
      </div>
    </main>
  );
}