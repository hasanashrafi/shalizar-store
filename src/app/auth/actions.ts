"use server";

import { redirect } from "next/navigation";
import {
  authenticateUser,
  clearUserSession,
  createUserSession,
  isUserAuthConfigured,
  registerUser,
} from "@/lib/user-auth";

export interface AuthActionState {
  error?: string;
  success?: string;
}

export async function loginUser(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";
  const password = formData.get("password") as string | null ?? "";

  if (!phone || !password) {
    return { error: "شماره تماس و رمز عبور را وارد کنید." };
  }

  const user = await authenticateUser(phone, password);
  if (!user) {
    return { error: "شماره تماس یا رمز عبور نادرست است." };
  }

  await createUserSession(user.id);
  redirect("/dashboard");
}

export async function registerUserAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isUserAuthConfigured()) {
    return {
      error: "ثبت‌نام فعلاً پیکربندی نشده است. بعداً مراجعه فرمایید.",
    };
  }

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";
  const password = formData.get("password") as string | null ?? "";
  const confirm = formData.get("confirmPassword") as string | null ?? "";

  if (!name || !phone || !password) {
    return { error: "همه فیلدها را پر کنید." };
  }
  if (password !== confirm) {
    return { error: "تکرار رمز عبور با رمز عبور مطابقت ندارد." };
  }
  if (password.length < 6) {
    return { error: "رمز عبور باید حداقل ۶ کاراکتر باشد." };
  }

  const result = await registerUser({ name, phone, password });
  if ("error" in result) {
    return { error: result.error };
  }

  await createUserSession(result.id);
  redirect("/dashboard/profile?onboarding=1");
}

export async function logoutUser(): Promise<void> {
  await clearUserSession();
  redirect("/auth/login");
}
