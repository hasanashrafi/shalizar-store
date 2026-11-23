import { z } from "zod";

// Iranian mobile phone number regex (starts with 09 and has 11 digits)
const iranianPhoneRegex = /^09[0-9]{9}$/;
const nationalIdRegex = /^[0-9۰-۹٠-٩]{10}$/;
const economicIdRegex = /^[0-9۰-۹٠-٩]{10,14}$/;

export const checkoutSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(3, { message: "نام و نام خانوادگی باید حداقل ۳ حرف باشد." })
      .max(120),
    userPhone: z
      .string()
      .regex(iranianPhoneRegex, {
        message: "شماره موبایل معتبر نیست (مثال: 09123456789).",
      }),
    companyName: z.string().trim().max(160).optional(),
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
    province: z.string().trim().min(2, { message: "انتخاب استان الزامی است." }),
    destinationCity: z
      .string()
      .trim()
      .min(2, { message: "وارد کردن شهر مقصد الزامی است." }),
    address: z
      .string()
      .trim()
      .min(10, {
        message: "آدرس دقیق انبار یا تخلیه بار باید حداقل ۱۰ حرف باشد.",
      })
      .max(1000),
    shippingType: z.enum(["CARRIER", "EXCLUSIVE_TRUCK", "FACTORY_PICKUP"], {
      message: "انتخاب روش ارسال الزامی است.",
    }),
    carrierName: z.string().trim().max(160).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine((buyer) => Boolean(buyer.nationalId || buyer.economicId), {
    message: "کد ملی یا شناسه ملی/اقتصادی خریدار را وارد کنید.",
    path: ["nationalId"],
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const orderSubmissionSchema = checkoutSchema
  .extend({
    items: z
      .array(
        z.object({
          productId: z.string().regex(/^[a-f\d]{24}$/i),
          quantityBags: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
          requestedKg: z
            .number()
            .positive()
            .max(Number.MAX_SAFE_INTEGER)
            .optional(),
        }),
      )
      .min(1)
      .max(50),
  })
  .refine(
    (order) =>
      new Set(order.items.map((item) => item.productId.toLowerCase())).size ===
      order.items.length,
    {
      message: "هر محصول باید فقط یک‌بار در پیش‌فاکتور ثبت شود.",
      path: ["items"],
    },
  );
