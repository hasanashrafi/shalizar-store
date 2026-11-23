import { redirect } from "next/navigation";
import AdminLoginForm from "./AdminLoginForm";
import { hasAdminSession, isAdminLoginConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await hasAdminSession()) redirect("/admin/orders");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 py-10 sm:py-12">
      <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl sm:p-8">
        <p className="text-sm font-bold text-amber-800">مدیریت شالیزار</p>
        <h1 className="mt-2 text-center text-xl font-extrabold text-stone-900 sm:text-2xl">
          ورود مدیر
        </h1>
        <p className="mb-7 mt-2 text-sm leading-6 text-stone-500">
          برای دسترسی به سفارش‌ها و موجودی انبار وارد شوید.
        </p>
        {!isAdminLoginConfigured() && (
          <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
            پیش از ورود، متغیرهای <code dir="ltr">ADMIN_USERNAME</code>،{" "}
            <code dir="ltr">ADMIN_PASSWORD</code> و{" "}
            <code dir="ltr">ADMIN_SESSION_SECRET</code> را در فایل{" "}
            <code dir="ltr">.env</code> تنظیم و سرور را مجدداً اجرا کنید.
          </p>
        )}
        <AdminLoginForm />
      </section>
    </main>
  );
}
