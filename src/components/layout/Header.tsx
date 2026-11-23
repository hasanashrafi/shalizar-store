"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuth } from "@/components/auth/AuthProvider";

function BrandLogo({
  size = "size-10",
}: {
  size?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#14532D] ring-2 ring-amber-500/40 ${size}`}
    >
      <span className="flex h-[78%] w-[78%] items-center justify-center overflow-hidden rounded-full bg-[#FAF8F5]">
        <Image
          src="/images/logo.jpg"
          alt="بازرگانی شالیزار"
          width={176}
          height={176}
          priority
          className="h-full w-full object-cover"
        />
      </span>
    </span>
  );
}

const navigation = [
  { href: "/products?type=rice", label: "برنج ایرانی" },
  { href: "/products?type=beans", label: "حبوبات عمده" },
  { href: "/products?type=barley", label: "غلات و دانه‌ها" },
  { href: "/products?discount=true", label: "تخفیف‌های ویژه", offer: true },
  { href: "/#about", label: "درباره شالیزار" },
];

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
      />
    </svg>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14532D] text-sm font-bold text-white">
      {initials}
    </div>
  );
}

export default function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const wishlistCount = useWishlistStore((state) => state.wishlistIds.length);
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantityBags, 0),
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof document === "undefined") return false;
    const saved = localStorage.getItem("shalizar-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return saved ? saved === "dark" : systemDark;
  });
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdminArea = Boolean(pathname && pathname.startsWith("/admin"));

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  const toggleDark = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof document !== "undefined") {
        if (next) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
        localStorage.setItem("shalizar-theme", next ? "dark" : "light");
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!useWishlistStore.persist.hasHydrated()) {
      void useWishlistStore.persist.rehydrate();
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const closeMenu = () => setSidebarOpen(false);

  const authLinks = isLoading ? null : isAuthenticated ? (
    <div className="relative">
      <button
        type="button"
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-[#E5E5E2] bg-white px-2 py-1.5 text-sm font-bold text-[#1F2937] transition-all hover:bg-stone-50"
        aria-label="منوی کاربر"
      >
        <UserAvatar name={user?.name || "م"} />
        <span className="hidden sm:inline">{user?.name}</span>
        <svg
          aria-hidden="true"
          className={`h-4 w-4 text-stone-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {userMenuOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-52 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-[#E5E5E2] bg-white py-2 shadow-xl">
          <Link
            href="/dashboard"
            onClick={() => setUserMenuOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            میز کار مشتری
          </Link>
          <Link
            href="/dashboard/wishlist"
            onClick={() => setUserMenuOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            محصولات نشان‌شده
          </Link>
          <div className="my-1 border-t border-[#E5E5E2]" />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-3 text-right text-sm font-medium text-rose-700 transition hover:bg-rose-50"
          >
            خروج از حساب
          </button>
        </div>
      )}
    </div>
  ) : (
    <Link
      href="/auth/login"
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#14532D] px-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0f3d22] hover:-translate-y-0.5 sm:px-5 sm:text-sm"
    >
      <span className="sm:hidden">ورود</span>
      <span className="hidden sm:inline">ورود / ثبت‌نام</span>
    </Link>
  );

  if (isAdminArea) {
    return null;
  }

  return (
    <header dir="rtl" className="sticky top-0 z-50">
      <div
        className={`border-b border-[#E5E5E2]/60 backdrop-blur-md transition-all duration-300 ${
          scrolled
            ? "bg-[#FAF8F5]/95 shadow-md shadow-[#14532D]/5"
            : "bg-[#FAF8F5]/90"
        }`}
      >
        <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-2 px-3 sm:min-h-[76px] sm:gap-3 sm:px-6">
          {/* Right: brand badge + title */}
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <BrandLogo size="h-10 w-10 sm:h-12 sm:w-12" />
            <span className="leading-tight">
              <span className="block text-base font-black text-[#14532D] sm:text-xl">
                شالیزار<span className="text-[#D97706]">.</span>
              </span>
              <span className="hidden text-[10px] text-stone-500 sm:block">
                عمده‌فروشی برنج و حبوبات
              </span>
            </span>
          </Link>

          {/* Center: pill search */}
          <form
            action="/products"
            method="get"
            className="mx-2 hidden w-[400px] max-w-full items-center gap-2 rounded-full border border-[#E5E5E2] bg-white px-5 py-2.5 text-sm lg:flex"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 20l-3.2-3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="search"
              name="search"
              placeholder="جستجو در شالیزار..."
              aria-label="جستجو در محصولات"
              className="w-full bg-transparent text-[#1F2937] outline-none placeholder:text-stone-400"
            />
          </form>

          {/* Left: actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/cart"
              aria-label={`سبد خرید${cartCount ? `، ${cartCount} قلم` : ""}`}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E5E2] bg-[#FAF8F5] text-[#1F2937] transition-all hover:border-amber-300 hover:text-amber-700"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 4h2l2.4 12.3a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="21" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="18" cy="21" r="1.4" fill="currentColor" stroke="none" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D97706] px-1 text-[10px] font-black text-white ring-2 ring-[#FAF8F5]">
                  {cartCount > 99 ? "۹۹+" : cartCount.toLocaleString("fa-IR")}
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/wishlist"
              aria-label={`علاقه‌مندی‌ها${wishlistCount ? `، ${wishlistCount} محصول` : ""}`}
              className="relative hidden h-11 w-11 items-center justify-center rounded-full border border-[#E5E5E2] bg-[#FAF8F5] text-stone-600 transition-all hover:border-rose-200 hover:text-rose-700 sm:flex"
            >
              <HeartIcon />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-700 px-1 text-[10px] font-bold text-white">
                  {wishlistCount > 99 ? "۹۹+" : wishlistCount.toLocaleString("fa-IR")}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label={darkMode ? "حالت روشن" : "حالت تاریک"}
              onClick={toggleDark}
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#E5E5E2] bg-[#FAF8F5] text-stone-600 transition-all hover:bg-stone-50 sm:flex"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            {authLinks}

            <button
              type="button"
              aria-label="باز کردن منو"
              onClick={() => setSidebarOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E5E2] bg-[#FAF8F5] text-[#1F2937] transition-all hover:bg-stone-50 lg:hidden"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sub navigation */}
        <div className="border-t border-[#E5E5E2]/40">
          <nav
            aria-label="ناوبری اصلی"
            className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-xs font-medium text-[#1F2937] sm:gap-x-8 sm:px-6 sm:py-2.5 sm:text-sm"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-1.5 transition-colors hover:text-[#14532D]"
              >
                {item.offer && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-600 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-700" />
                  </span>
                )}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* منوی موبایل */}
      <div className={`fixed inset-0 z-[60] flex lg:hidden ${sidebarOpen ? "" : "hidden"}`}>
        <div
          className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"
          onClick={closeMenu}
          aria-hidden="true"
        />
        <aside
          className={`absolute right-0 top-0 bottom-0 flex w-full max-w-[320px] flex-col border-l border-[#E5E5E2] bg-[#FAF8F5] shadow-2xl transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="navigation"
          aria-label="منو موبایل"
        >
          <div className="flex items-center justify-between border-b border-[#E5E5E2] p-5">
            <span className="flex items-center gap-2">
              <BrandLogo size="size-9" />
              <span className="text-base font-black text-[#14532D]">شالیزار</span>
            </span>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="بستن منو"
              className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-200/60"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  item.offer
                    ? "text-rose-700 hover:bg-rose-50"
                    : "text-stone-700 hover:bg-stone-200/50 hover:text-[#14532D]"
                }`}
              >
                {item.offer && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-600 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-700" />
                  </span>
                )}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-3 border-t border-[#E5E5E2] p-5">
            <button
              type="button"
              onClick={toggleDark}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#E5E5E2] bg-white text-sm font-bold text-stone-700 transition hover:bg-stone-50"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
              {darkMode ? "حالت روشن" : "حالت تاریک"}
            </button>
            {isLoading ? null : isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="flex min-h-11 w-full items-center justify-center rounded-full bg-[#14532D] px-4 text-sm font-bold text-white transition hover:bg-[#0f3d22]"
                >
                  میز کار مشتری
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl border border-[#E5E5E2] bg-white text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                >
                  خروج از حساب
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="flex min-h-11 w-full items-center justify-center rounded-full bg-[#14532D] text-sm font-bold text-white transition hover:bg-[#0f3d22]"
              >
                ورود / ثبت‌نام
              </Link>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}