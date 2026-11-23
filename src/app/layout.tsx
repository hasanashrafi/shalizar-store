import type { Metadata } from "next";
import ThemeProvider from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ThemeInitializer from "@/components/ThemeInitializer";
import LayoutChrome from "@/components/layout/LayoutChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "شالیزار | سامانه عمده‌فروشی و تناژ حبوبات",
  description: "مرجع استلام قیمت و خرید مستقیم انواع حبوبات با کالیبر تضمینی",
  other: {
    "theme-color": "#14532D",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "شالیزار",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="antialiased" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[#FAF8F5] font-sans text-[#1C1917] antialiased transition-colors duration-300 dark:bg-[#0b1120] dark:text-stone-100">
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <ThemeInitializer />
        <ThemeProvider>
          <AuthProvider>
            <LayoutChrome>{children}</LayoutChrome>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}