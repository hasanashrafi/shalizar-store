"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

const navItems = [
  { href: "/", label: "خانه", icon: <HomeIcon /> },
  { href: "/products", label: "محصولات", icon: <ProductsIcon /> },
  { href: "/cart", label: "سبد", icon: <CartIcon /> },
  { href: "/dashboard/wishlist", label: "علاقه‌مندی‌ها", icon: <HeartIcon /> },
  { href: "/dashboard", label: "پروفایل", icon: <ProfileIcon /> },
];

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h8a2 2 0 0 0 1.99-1.57l2.66-12.42h2" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.05 1.29-3.82 2.5" />
      <path d="M12.5 18c-1.13 0-2.07-.9-2.47-1.95l-.28-.71c-.32-.66-.08-1.47.46-1.8l.74-.46c.47-.29 1.06-.12 1.43.35l.64.83c.25.32.43.73.43 1.16 0 .87-.7 1.58-1.57 1.92z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantityBags, 0),
  );
  const wishlistCount = useWishlistStore((state) => state.wishlistIds.length);

  return (
      <nav
        aria-label="منو پایین صفحه موبایل"
        className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center rounded-t-3xl border-t border-[#E5E5E2] bg-[#FAF8F5]/95 backdrop-blur-md p-2 pb-6 sm:p-2.5 sm:pb-7 shadow-lg dark:bg-[#0b1120]/90 ${className || ""}`}
    >
      <div className="flex w-full max-w-md items-center justify-around gap-1 px-2 sm:px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const count =
            item.label === "سبد" ? cartCount : item.label === "علاقه‌مندی‌ها"
              ? wishlistCount
              : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? "bg-[#14532D]/10 text-[#14532D] dark:text-emerald-400 dark:bg-emerald-900/20"
                  : "text-stone-500 hover:text-[#14532D] hover:bg-stone-100 dark:text-stone-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-bold leading-none">
                {item.label}
              </span>
              {count > 0 && item.label !== "خانه" && item.label !== "پروفایل" && (
                <span className="absolute -top-1 -right-1 flex h-3 min-w-3 items-center justify-center rounded-full bg-[#D97706] px-0.5 text-[9px] font-black text-white ring-1 ring-[#FAF8F5]">
                  {count > 9 ? "۹+" : count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
