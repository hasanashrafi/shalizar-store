"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface FooterProps {
  businessPhone?: string;
  warehouseAddress?: string;
}

const quickLinks = [
  { label: "همه بارهای آماده", href: "/products" },
  { label: "لوبیا", href: "/products?type=beans" },
  { label: "نخود", href: "/products?type=chickpea" },
  { label: "عدس", href: "/products?type=lentils" },
  { label: "ماش و سویا", href: "/products?type=mash" },
];

const services = [
  { label: "ورود به حساب", href: "/auth/login" },
  { label: "ثبت‌نام مشتری", href: "/auth/register" },
  { label: "میز کار و سفارش‌ها", href: "/dashboard" },
  { label: "محصولات نشان‌شده", href: "/dashboard/wishlist" },
  { label: "پیش‌فاکتور و ثبت سفارش", href: "/cart" },
];

export default function Footer({
  businessPhone,
  warehouseAddress,
}: FooterProps) {
  const pathname = usePathname();
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer
      dir="rtl"
      className="mt-16 bg-[#1C1917] text-stone-300"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* معرفی برند */}
        <section>
          <Link href="/" className="mb-5 inline-flex items-center">
            <span className="inline-flex size-14 items-center justify-center overflow-hidden rounded-full bg-[#FAF8F5] shadow-md ring-2 ring-amber-500/40">
              <Image
                src="/images/logo.jpg"
                alt="بازرگانی شالیزار"
                width={176}
                height={176}
                className="h-full w-full object-cover"
              />
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-7 text-stone-400">
            تأمین و عرضهٔ عمدهٔ حبوبات ایرانی و وارداتی با مشخصات فنی روشن،
            قیمت‌گذاری پلکانی و هماهنگی مستقیم برای بارگیری از بارانداز مرکزی.
          </p>
          <div className="mt-6 flex gap-3">
            {["📘", "📷", "📕"].map((icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="شبکه اجتماعی"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-700 bg-stone-800/60 text-stone-300 transition-all hover:border-amber-500 hover:bg-stone-800"
              >
                <span aria-hidden="true" className="text-lg">{icon}</span>
              </a>
            ))}
          </div>
        </section>

        {/* کاتالوگ سریع */}
        <section>
          <h2 className="mb-5 text-sm font-extrabold uppercase tracking-wider text-white">
            کاتالوگ حبوبات
          </h2>
          <ul className="space-y-3 text-sm">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-stone-400 transition-all hover:pr-1 hover:text-amber-500"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* خدمات مشتریان */}
        <section>
          <h2 className="mb-5 text-sm font-extrabold uppercase tracking-wider text-white">
            خدمات مشتریان
          </h2>
          <ul className="space-y-3 text-sm">
            {services.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-stone-400 transition-all hover:pr-1 hover:text-amber-500"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* تماس و بارانداز */}
        <section>
          <h2 className="mb-5 text-sm font-extrabold uppercase tracking-wider text-white">
            تماس و بارانداز مرکزی
          </h2>
          <div className="space-y-4 text-sm leading-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-amber-500">📍</span>
              <p className="text-stone-400">
                {warehouseAddress ||
                  "نشانی بارانداز هنگام تأیید و هماهنگی سفارش اعلام می‌شود."}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-amber-500">📞</span>
              {businessPhone ? (
                <a
                  href={`tel:${businessPhone.replace(/[^\d+]/g, "")}`}
                  dir="ltr"
                  className="inline-block font-bold text-amber-500 transition-colors hover:text-amber-400"
                >
                  {businessPhone}
                </a>
              ) : (
                <p className="text-stone-400">
                  برای هماهنگی بازرگانی، پیش‌فاکتور خود را ثبت کنید.
                </p>
              )}
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-amber-500">🕒</span>
              <p className="text-stone-400">شنبه تا پنجشنبه · ۸ صبح تا ۱۷</p>
            </div>
          </div>
        </section>
      </div>

      <div className="border-t border-stone-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-stone-500 sm:px-6 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear().toLocaleString("fa-IR")} بازرگانی شالیزار</span>
          <span>بازار عمده‌فروشی حبوبات · خرید مطمئن، تحویل هماهنگ</span>
        </div>
      </div>
    </footer>
  );
}