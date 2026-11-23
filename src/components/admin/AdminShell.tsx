"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { logoutAdmin } from "@/app/admin/actions";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-5 w-5",
  "aria-hidden": true,
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "فروش و سفارش‌ها",
    items: [
      { href: "/admin/analytics", label: "داشبورد", icon: <DashboardIcon /> },
      { href: "/admin/orders", label: "سفارش‌ها", icon: <OrdersIcon /> },
      { href: "/admin/payments", label: "پرداخت‌ها", icon: <PaymentsIcon /> },
      { href: "/admin/customers", label: "مشتریان", icon: <CustomersIcon /> },
    ],
  },
  {
    title: "انبار و کالا",
    items: [
      { href: "/admin/products", label: "محصولات", icon: <ProductsIcon /> },
      { href: "/admin/product-views", label: "بازدیدها", icon: <ViewsIcon /> },
    ],
  },
  {
    title: "مالی",
    items: [
      { href: "/admin/expenses", label: "هزینه‌ها", icon: <ExpensesIcon /> },
      { href: "/admin/cash-flow", label: "جریان نقدی", icon: <CashFlowIcon /> },
      { href: "/admin/discounts", label: "تخفیف‌ها", icon: <DiscountsIcon /> },
    ],
  },
  {
    title: "محتوا",
    items: [
      { href: "/admin/articles", label: "مقالات", icon: <ArticlesIcon /> },
    ],
  },
];

function DashboardIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-5 3 3 5-7" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 11a3 3 0 1 0 0-6" />
      <path d="M18 20a6 6 0 0 0-3-5.2" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </svg>
  );
}

function ViewsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function ExpensesIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 15h4" />
    </svg>
  );
}

function CashFlowIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 17l6-6 4 4 7-8" />
      <path d="M14 7h6v6" />
    </svg>
  );
}

function DiscountsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20 12l-8 8-8-8V4h8l8 8z" />
      <circle cx="8" cy="8" r="1.5" />
    </svg>
  );
}

function ArticlesIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 4h11l5 5v11H4z" />
      <path d="M8 9h6M8 13h8M8 17h5" />
    </svg>
  );
}

function isItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/admin/analytics") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <nav aria-label="ناوبری مدیریت" className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-emerald-400/70">
            {group.title}
          </p>
          <ul className="space-y-1.5">
            {group.items.map((item) => {
              const active = isItemActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-2xl px-4 font-bold transition-all ${
                      active
                        ? "bg-emerald-900/20 text-emerald-300 shadow-sm border border-emerald-900/30"
                        : "text-stone-600 hover:text-emerald-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-emerald-400 dark:hover:bg-stone-800/50"
                    }`}
                  >
                    <span className={active ? "text-amber-400" : "text-stone-400 dark:text-stone-500"}>
                      {item.icon}
                    </span>
                    <span className={active ? "font-black" : "font-bold"}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50 dark:bg-[#0b1120]">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-stone-200/60 bg-white/80 backdrop-blur-md px-4 py-3 dark:bg-slate-900/80 dark:border-slate-800 xl:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="باز کردن منوی مدیریت"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300/60 text-stone-600 dark:text-stone-300 dark:border-slate-700 transition hover:bg-stone-100 dark:hover:bg-slate-800"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <Link href="/admin/analytics" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#FAF8F5] ring-2 ring-amber-500/40 dark:bg-slate-800">
            <Image
              src="/images/logo.jpg"
              alt="بازرگانی شالیزار"
              width={176}
              height={176}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="text-sm font-black text-stone-900 dark:text-stone-100">
            مدیریت شالیزار
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300/60 text-stone-600 dark:text-stone-300 dark:border-slate-700 transition hover:bg-stone-100 dark:hover:bg-slate-800"
          aria-label="(menu"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[280px] max-w-full flex-col border-l border-stone-200/60 bg-white dark:bg-[#0b1120] text-white shadow-2xl transition-transform duration-300 xl:translate-x-0 xl:shadow-none dark:border-slate-800 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-stone-200/40 px-4 py-4 dark:border-slate-800">
          <Link href="/admin/analytics" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#FAF8F5] ring-2 ring-amber-500/40 dark:bg-slate-800">
              <Image
                src="/images/logo.jpg"
                alt="بازرگانی شالیزار"
                width={176}
                height={176}
                className="h-full w-full object-cover"
                priority
              />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-black text-stone-900 dark:text-stone-100">
                مدیریت شالیزار
              </span>
              <span className="block text-[10px] text-emerald-400/70">
                پنل انبار و مالی
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="بستن منو"
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 dark:text-stone-400 transition hover:bg-stone-100 dark:hover:bg-slate-800 xl:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />

        <div className="mt-auto space-y-2 border-t border-stone-200/40 px-4 py-6 dark:border-slate-800">
          <Link
            href="/"
            className="flex min-h-10 items-center gap-2 rounded-xl border border-stone-200/60 px-3 text-sm font-bold text-stone-600 dark:text-stone-300 dark:border-slate-700 transition hover:bg-stone-100 dark:hover:bg-slate-800"
          >
            <svg {...iconProps}>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <path d="M10 17l5-5-5-5M15 12H3" />
            </svg>
            مشاهده سایت
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-200/50 bg-rose-50 px-3 text-sm font-bold text-rose-800 transition hover:bg-rose-100 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-800/30"
            >
              <svg {...iconProps}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5M21 12H9" />
              </svg>
              خروج امن
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="بستن منو"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm dark:bg-stone-900/80 xl:hidden"
        />
      )}

      {/* Content */}
      <main className={`xl:pr-[280px] min-h-screen`}>{children}</main>

      {/* Mobile bottom nav (app-like) */}
      <BottomNav pathname={pathname} />
    </div>
  );
}

function BottomNav({ pathname }: { pathname: string | null }) {
  const items = [
    { href: "/admin/analytics", label: "داشبورد", icon: <DashboardIcon /> },
    { href: "/admin/orders", label: "سفارش‌ها", icon: <OrdersIcon /> },
    { href: "/admin/customers", label: "مشتریان", icon: <CustomersIcon /> },
    { href: "/admin/products", label: "محصولات", icon: <ProductsIcon /> },
    { href: "/admin/discounts", label: "تخفیف‌ها", icon: <DiscountsIcon /> },
  ];

  return (
    <nav
      aria-label="منو پایین صفحه مدیریت"
      className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center border-t border-stone-200/60 bg-white/90 backdrop-blur-md px-2 pb-3 sm:px-3 dark:bg-[#0b1120]/90 dark:border-slate-800 xl:hidden shadow-xl`}
    >
      <div className="flex w-full max-w-md items-center justify-around gap-1 px-2">
        {items.map((item) => {
          const active = isItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
                active
                  ? "bg-emerald-900/20 text-emerald-400 shadow-sm border border-emerald-900/30"
                  : "text-stone-400 hover:text-emerald-900 hover:bg-stone-100 dark:text-stone-600 dark:hover:text-emerald-400 dark:hover:bg-slate-800/50"
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-black leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
