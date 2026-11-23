import { z } from "zod";

const iranianPhoneRegex = /^09[0-9]{9}$/;
const nationalIdRegex = /^[0-9۰-۹٠-٩]{10}$/;
const economicIdRegex = /^[0-9۰-۹٠-٩]{10,14}$/;

const optionalText = (max: number) =>
  z.string().trim().max(max).optional();

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "نام و نام خانوادگی باید حداقل ۳ حرف باشد." })
    .max(120),
  phone: z
    .string()
    .regex(iranianPhoneRegex, {
      message: "شماره موبایل معتبر نیست (مثال: 09123456789).",
    }),
  email: z
    .union([z.literal(""), z.string().trim().email("ایمیل معتبر نیست.")])
    .optional(),
  companyName: optionalText(160),
  nationalId: z
    .string()
    .trim()
    .regex(nationalIdRegex, "کد ملی باید ۱۰ رقم باشد.")
    .or(z.literal(""))
    .optional(),
  economicId: z
    .string()
    .trim()
    .regex(economicIdRegex, "شناسه ملی/اقتصادی باید ۱۰ تا ۱۴ رقم باشد.")
    .or(z.literal(""))
    .optional(),
  province: optionalText(60),
  destinationCity: optionalText(80),
  address: optionalText(1000),
  carrierName: optionalText(160),
  preferredShippingType: z
    .enum(["CARRIER", "EXCLUSIVE_TRUCK", "FACTORY_PICKUP"])
    .or(z.literal(""))
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;