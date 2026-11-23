import Link from "next/link";
import type { ReactNode } from "react";
import { getUserById, requireUserLogin } from "@/lib/user-auth";

const menu = [
  { href: "/dashboard", label: "سفارش‌ها و پیش‌فاکتورها", icon: "▤", active: true },
  { href: "/dashboard/profile", label: "اطلاعات پروفایل من", icon: "☺" },
  { href: "/dashboard/wishlist", label: "محصولات نشان‌شده", icon: "♡", highlight: true },
  { href: "/products?discount=true", label: "بارهای تخفیف‌دار", icon: "٪" },
];

export default async function CustomerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userId = await requireUserLogin();
  const user = await getUserById(userId);

  return (
    <div dir="rtl" className="min-h-[65vh] bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8 lg:py-12">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          {/* کارت پروفایل خریدار */}
          <div className="rounded-3xl bg-emerald-900 p-5 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-black text-amber-300">
                ش
              </div>
              <div className="min-w-0">
                <p className="truncate font-extrabold">{user?.name ?? "حساب کاربری"}</p>
                <p className="text-xs text-emerald-100/80" dir="ltr">
                  {user?.phone ?? "خریدار عمده"}
                </p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold text-amber-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
              {user?.profileCompleted ? "پروفایل تکمیل‌شده" : "تکمیل اطلاعات پروفایل"}
            </span>
            {!user?.profileCompleted && (
              <Link
                href="/dashboard/profile?onboarding=1"
                className="mt-3 block rounded-xl bg-amber-500 px-3 py-2 text-center text-[11px] font-bold text-white transition hover:bg-amber-600"
              >
                تکمیل اطلاعات برای خرید سریع‌تر
              </Link>
            )}
          </div>

          {/* منو دسترسی سریع */}
          <nav
            aria-label="ناوبری میز کار"
            className="rounded-3xl border border-[#E7E5E4] bg-white p-3 shadow-sm"
          >
            <ul className="space-y-1">
              {menu.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
                      item.active
                        ? "bg-emerald-50 text-emerald-900"
                        : "text-stone-700 hover:bg-stone-100 hover:text-emerald-900"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={
                        item.highlight
                          ? "text-rose-700"
                          : item.active
                            ? "text-emerald-900"
                            : "text-amber-600"
                      }
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}