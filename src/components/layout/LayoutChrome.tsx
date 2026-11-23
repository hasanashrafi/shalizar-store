"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import BottomNav from "@/components/layout/BottomNav";

export default function LayoutChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith("/auth");
  const isPrintRoute = pathname?.includes("/print");
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAuthRoute || isPrintRoute || isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <InstallPrompt />
      <BottomNav className="lg:hidden" />
      <Footer
        businessPhone={process.env.NEXT_PUBLIC_BUSINESS_PHONE}
        warehouseAddress={process.env.NEXT_PUBLIC_WAREHOUSE_ADDRESS}
      />
    </>
  );
}