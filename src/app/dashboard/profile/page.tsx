import { getUserById, getUserSessionUserId } from "@/lib/user-auth";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const userId = await getUserSessionUserId();
  const user = userId ? await getUserById(userId) : null;

  if (!user) {
    return (
      <div className="rounded-3xl border border-dashed border-[#E5E5E2] bg-white p-6 text-center sm:p-10">
        <p className="text-sm text-stone-600">برای مشاهده پروفایل وارد شوید.</p>
      </div>
    );
  }

  const params = await searchParams;
  const onboarding = params.onboarding === "1";

  return (
    <div>
      <div className="mb-6">
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900">
          ویرایش پروفایل
        </span>
            <h1 className="mt-3 text-xl font-black text-[#1F2937] sm:text-2xl">
          اطلاعات حساب و پروفایل من
        </h1>
        <p className="mt-2 text-sm leading-7 text-stone-600">
          این اطلاعات در فرم خرید به‌صورت خودکار نمایش داده می‌شود تا مجبور
          نباشید هر بار فرم را از نو پر کنید.
        </p>
      </div>

      <ProfileForm
        onboarding={onboarding}
        user={{
          name: user.name,
          phone: user.phone,
          email: user.email ?? null,
          companyName: user.companyName ?? null,
          nationalId: user.nationalId ?? null,
          economicId: user.economicId ?? null,
          province: user.province ?? null,
          destinationCity: user.destinationCity ?? null,
          address: user.address ?? null,
          carrierName: user.carrierName ?? null,
          preferredShippingType: user.preferredShippingType ?? null,
        }}
      />
    </div>
  );
}