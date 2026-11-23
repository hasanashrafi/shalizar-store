"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { getUserSessionUserId } from "@/lib/user-auth";
import { profileSchema } from "@/lib/validations/profile";
import User from "@/models/User";

export interface ProfileActionState {
  error?: string;
  success?: string;
}

function textOrNull(value: FormDataEntryValue | null): string | null {
  const trimmed = (value as string | null)?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateUserProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const userId = await getUserSessionUserId();
  if (!userId) {
    return { error: "برای ویرایش پروفایل ابتدا وارد حساب خود شوید." };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    email: textOrNull(formData.get("email")) ?? "",
    companyName: textOrNull(formData.get("companyName")) ?? "",
    nationalId: textOrNull(formData.get("nationalId")) ?? "",
    economicId: textOrNull(formData.get("economicId")) ?? "",
    province: textOrNull(formData.get("province")) ?? "",
    destinationCity: textOrNull(formData.get("destinationCity")) ?? "",
    address: textOrNull(formData.get("address")) ?? "",
    carrierName: textOrNull(formData.get("carrierName")) ?? "",
    preferredShippingType:
      textOrNull(formData.get("preferredShippingType")) ?? "",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "اطلاعات وارد شده معتبر نیست.",
    };
  }

  const data = parsed.data;

  await connectToDatabase();

  const phoneTaken = await User.findOne({
    phone: data.phone,
    _id: { $ne: userId },
  }).lean();
  if (phoneTaken) {
    return { error: "این شماره تماس قبلاً برای حساب دیگری ثبت شده است." };
  }

  const profileCompleted = Boolean(
    data.province && data.destinationCity && data.address,
  );

  await User.findByIdAndUpdate(userId, {
    name: data.name,
    phone: data.phone,
    email: data.email ? data.email : null,
    companyName: data.companyName ?? null,
    nationalId: data.nationalId ?? null,
    economicId: data.economicId ?? null,
    province: data.province ?? null,
    destinationCity: data.destinationCity ?? null,
    address: data.address ?? null,
    carrierName: data.carrierName ?? null,
    preferredShippingType: data.preferredShippingType
      ? data.preferredShippingType
      : null,
    profileCompleted,
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/cart");
  revalidatePath("/api/auth/me");

  return { success: "اطلاعات پروفایل شما ذخیره شد." };
}