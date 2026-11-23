"use server";

import { isValidObjectId, Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { getUserSessionUserId, getUserById } from "@/lib/user-auth";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import CashFlow from "@/models/CashFlow";
import Product from "@/models/Product";

export interface PaymentActionState {
  error?: string;
  success?: string;
  warning?: string;
}

interface OwnedOrderItem {
  productId: Types.ObjectId;
  requestedKg: number;
  productTitle: string;
}

interface OwnedOrderData {
  _id: Types.ObjectId;
  userPhone: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  items: OwnedOrderItem[];
}

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || !Number.isNaN(new Date(value).getTime()),
    "تاریخ نامعتبر است.",
  );

const chequeSchema = z.object({
  orderId: z.string().regex(/^[a-f\d]{24}$/i, "شناسه سفارش نامعتبر است."),
  accountHolder: z.string().trim().min(3, "نام صاحب حساب را وارد کنید.").max(120),
  bankName: z.string().trim().min(2, "نام بانک را وارد کنید.").max(120),
  branchName: z.string().trim().max(120).optional(),
  accountNumber: z.string().trim().max(40).optional(),
  chequeNumber: z
    .string()
    .trim()
    .min(3, "شماره چک را وارد کنید.")
    .max(40),
  chequeSerial: z.string().trim().max(60).optional(),
  issueDate: optionalDate,
  dueDate: optionalDate,
  amount: z.string().trim().optional(),
});

type OwnedOrderResult =
  | { error: string }
  | { order: OwnedOrderData; userId: string };

const bankTransferSchema = z.object({
  orderId: z.string().regex(/^[a-f\d]{24}$/i, "شناسه سفارش نامعتبر است."),
  depositorName: z
    .string()
    .trim()
    .min(3, "نام واریزکننده را وارد کنید.")
    .max(120),
  bankName: z.string().trim().min(2, "نام بانک را وارد کنید.").max(120),
  cardNumber: z
    .string()
    .trim()
    .min(4, "شماره کارت یا حساب مقصد را وارد کنید.")
    .max(40),
  amount: z.string().trim().optional(),
  depositDate: optionalDate,
  trackingRef: z.string().trim().max(60).optional(),
});

async function loadOwnedOrder(orderId: string): Promise<OwnedOrderResult> {
  const userId = await getUserSessionUserId();
  if (!userId) return { error: "برای ادامه ابتدا وارد حساب خود شوید." };

  await connectToDatabase();
  const user = await getUserById(userId);
  if (!user || !user.isActive) {
    return { error: "حساب کاربری شما غیرفعال است." };
  }

  if (!isValidObjectId(orderId)) {
    return { error: "شناسه سفارش نامعتبر است." };
  }

  const order = await Order.findById(orderId).lean();
  if (!order) return { error: "سفارش موردنظر پیدا نشد." };

  if (order.userPhone !== user.phone) {
    return { error: "دسترسی به این سفارش مجاز نیست." };
  }

  return { order: order as unknown as OwnedOrderData, userId };
}

export async function payOrderOnline(
  _previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const orderId = String(formData.get("orderId") ?? "");

  const loaded = await loadOwnedOrder(orderId);
  if ("error" in loaded) return { error: loaded.error };
  const { order } = loaded;

  if (order.paymentStatus === "PAID") {
    return { error: "این سفارش قبلاً پرداخت شده است." };
  }
  if (order.status === "CANCELLED") {
    return { error: "سفارش لغوشده قابل پرداخت نیست." };
  }

  await connectToDatabase();

  const gatewayRef = `SIM-${Date.now().toString(36).toUpperCase()}-${orderId
    .slice(-4)
    .toUpperCase()}`;

  await Payment.create({
    orderId: order._id,
    orderNumber: order._id.toString().slice(-8).toUpperCase(),
    userPhone: order.userPhone,
    customerName: order.customerName,
    amount: order.totalAmount,
    method: "ONLINE",
    status: "PAID",
    gatewayRef,
    transactionDate: new Date(),
    notes: "پرداخت اینترنتی شبیه‌سازی‌شده",
  });

  // If there were previously rejected cheques, cancel them
  await Payment.updateMany(
    { orderId: order._id, status: { $in: ["PENDING", "REJECTED"] } },
    { $set: { status: "CANCELLED" } },
  );

  await Order.updateOne(
    { _id: order._id },
    {
      $set: {
        paymentMethod: "ONLINE",
        paymentStatus: "PAID",
        status: "PAID",
      },
    },
  );

  await CashFlow.create({
    type: "SALE",
    amount: order.totalAmount,
    description: `فروش (پرداخت آنلاین): سفارش ${order._id
      .toString()
      .slice(-8)
      .toUpperCase()}`,
    referenceId: order._id,
    referenceModel: "Order",
    category: "SALE",
    paymentMethod: "BANK_TRANSFER",
    status: "COMPLETED",
    date: new Date(),
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/cash-flow");

  return { success: "پرداخت اینترنتی با موفقیت ثبت شد." };
}

export async function submitChequePayment(
  _previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const parsed = chequeSchema.safeParse({
    orderId: formData.get("orderId"),
    accountHolder: formData.get("accountHolder"),
    bankName: formData.get("bankName"),
    branchName: formData.get("branchName") ?? "",
    accountNumber: formData.get("accountNumber") ?? "",
    chequeNumber: formData.get("chequeNumber"),
    chequeSerial: formData.get("chequeSerial") ?? "",
    issueDate: formData.get("issueDate") ?? "",
    dueDate: formData.get("dueDate") ?? "",
    amount: formData.get("amount") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات چک نامعتبر است." };
  }

  const loaded = await loadOwnedOrder(parsed.data.orderId);
  if ("error" in loaded) return { error: loaded.error };
  const { order } = loaded;

  if (order.paymentStatus === "PAID") {
    return { error: "این سفارش قبلاً پرداخت شده است." };
  }
  if (order.status === "CANCELLED") {
    return { error: "سفارش لغوشده قابل پرداخت نیست." };
  }

  await connectToDatabase();

  const amount = parsed.data.amount
    ? Number(parsed.data.amount)
    : order.totalAmount;
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "مبلغ چک نامعتبر است." };
  }

  await Payment.updateMany(
    { orderId: order._id, status: { $in: ["PENDING", "REJECTED"] } },
    { $set: { status: "CANCELLED" } },
  );

  await Payment.create({
    orderId: order._id,
    orderNumber: order._id.toString().slice(-8).toUpperCase(),
    userPhone: order.userPhone,
    customerName: order.customerName,
    amount,
    method: "CHEQUE",
    status: "PENDING",
    accountHolder: parsed.data.accountHolder,
    bankName: parsed.data.bankName,
    branchName: parsed.data.branchName || undefined,
    accountNumber: parsed.data.accountNumber || undefined,
    chequeNumber: parsed.data.chequeNumber,
    chequeSerial: parsed.data.chequeSerial || undefined,
    issueDate: parsed.data.issueDate ? new Date(parsed.data.issueDate) : undefined,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    notes: "ثبت چک توسط مشتری",
  });

  await Order.updateOne(
    { _id: order._id },
    { $set: { paymentMethod: "CHEQUE", paymentStatus: "AWAITING_CLEARING" } },
  );

  revalidatePath(`/orders/${order._id.toString()}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/payments");

  return {
    success: "چک با موفقیت ثبت شد.",
    warning:
      "پس از ثبت چک، فاکتور در انتظار تأیید و وصول توسط مدیر است و وضعیت نهایی پس از بررسی اعلام می‌شود.",
  };
}

export async function submitBankTransfer(
  _previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const parsed = bankTransferSchema.safeParse({
    orderId: formData.get("orderId"),
    depositorName: formData.get("depositorName"),
    bankName: formData.get("bankName"),
    cardNumber: formData.get("cardNumber"),
    amount: formData.get("amount") ?? "",
    depositDate: formData.get("depositDate") ?? "",
    trackingRef: formData.get("trackingRef") ?? "",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "اطلاعات واریز معتبر نیست.",
    };
  }

  const loaded = await loadOwnedOrder(parsed.data.orderId);
  if ("error" in loaded) return { error: loaded.error };
  const { order } = loaded;

  if (order.paymentStatus === "PAID") {
    return { error: "این سفارش قبلاً پرداخت شده است." };
  }
  if (order.status === "CANCELLED") {
    return { error: "سفارش لغوشده قابل پرداخت نیست." };
  }

  await connectToDatabase();

  const amount = parsed.data.amount
    ? Number(parsed.data.amount)
    : order.totalAmount;
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "مبلغ واریزی معتبر نیست." };
  }

  const receiptFile = formData.get("receipt");
  let receiptImage: string | undefined;
  if (receiptFile instanceof File && receiptFile.size > 0) {
    if (!receiptFile.type.startsWith("image/")) {
      return { error: "فقط تصویر رسید مجاز است." };
    }
    if (receiptFile.size > 2 * 1024 * 1024) {
      return { error: "حجم تصویر رسید باید کمتر از ۲ مگابایت باشد." };
    }
    const buffer = Buffer.from(await receiptFile.arrayBuffer());
    receiptImage = `data:${receiptFile.type};base64,${buffer.toString("base64")}`;
  }

  await Payment.updateMany(
    { orderId: order._id, status: { $in: ["PENDING", "REJECTED"] } },
    { $set: { status: "CANCELLED" } },
  );

  await Payment.create({
    orderId: order._id,
    orderNumber: order._id.toString().slice(-8).toUpperCase(),
    userPhone: order.userPhone,
    customerName: order.customerName,
    amount,
    method: "BANK_TRANSFER",
    status: "PENDING",
    depositorName: parsed.data.depositorName,
    bankName: parsed.data.bankName,
    cardNumber: parsed.data.cardNumber,
    depositDate: parsed.data.depositDate
      ? new Date(parsed.data.depositDate)
      : undefined,
    trackingRef: parsed.data.trackingRef || undefined,
    receiptImage,
    notes: "کارت به کارت / واریز بانکی توسط مشتری",
  });

  await Order.updateOne(
    { _id: order._id },
    {
      $set: {
        paymentMethod: "BANK_TRANSFER",
        paymentStatus: "AWAITING_CLEARING",
      },
    },
  );

  revalidatePath(`/orders/${order._id.toString()}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/payments");

  return {
    success: "اطلاعات واریز بانکی ثبت شد.",
    warning:
      "پس از ثبت، پرداخت شما در انتظار تأیید و تطبیق توسط مدیر است و وضعیت نهایی پس از بررسی اعلام می‌شود.",
  };
}

export async function selectCashOnDelivery(
  _previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const orderId = String(formData.get("orderId") ?? "");
  const loaded = await loadOwnedOrder(orderId);
  if ("error" in loaded) return { error: loaded.error };
  const { order } = loaded;

  if (order.paymentStatus === "PAID") {
    return { error: "این سفارش قبلاً پرداخت شده است." };
  }
  if (order.status === "CANCELLED") {
    return { error: "سفارش لغوشده قابل پرداخت نیست." };
  }

  await connectToDatabase();

  await Payment.updateMany(
    { orderId: order._id, status: { $in: ["PENDING", "REJECTED"] } },
    { $set: { status: "CANCELLED" } },
  );

  await Payment.create({
    orderId: order._id,
    orderNumber: order._id.toString().slice(-8).toUpperCase(),
    userPhone: order.userPhone,
    customerName: order.customerName,
    amount: order.totalAmount,
    method: "CASH_ON_DELIVERY",
    status: "PENDING",
    notes: "پرداخت نقدی در محل تحویل",
  });

  await Order.updateOne(
    { _id: order._id },
    { $set: { paymentMethod: "CASH_ON_DELIVERY", paymentStatus: "UNPAID" } },
  );

  revalidatePath(`/orders/${order._id.toString()}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/payments");

  return {
    success: "پرداخت نقدی در محل تحویل انتخاب شد.",
    warning:
      "مبلغ سفارش هنگام تحویل بار به‌صورت نقدی پرداخت می‌شود. لطفاً هماهنگی لازم را با انبار انجام دهید.",
  };
}

export async function resetPaymentSelection(
  _previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const orderId = String(formData.get("orderId") ?? "");
  const loaded = await loadOwnedOrder(orderId);
  if ("error" in loaded) return { error: loaded.error };
  const { order } = loaded;

  if (order.status === "CANCELLED") {
    return { error: "سفارش لغوشده قابل ویرایش نیست." };
  }
  if (order.paymentStatus === "PAID" || order.status === "PAID") {
    return { error: "سفارش پرداخت‌شده قابل تغییر نیست." };
  }

  await connectToDatabase();

  await Payment.updateMany(
    { orderId: order._id, status: { $in: ["PENDING", "REJECTED"] } },
    { $set: { status: "CANCELLED" } },
  );

  await Order.updateOne(
    { _id: order._id },
    { $set: { paymentMethod: null, paymentStatus: "UNPAID" } },
  );

  revalidatePath(`/orders/${order._id.toString()}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/payments");

  return { success: "روش پرداخت انتخابی پاک شد؛ می‌توانید روش دیگری انتخاب کنید." };
}

export async function cancelOrder(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");

  const loaded = await loadOwnedOrder(orderId);
  if ("error" in loaded) {
    throw new Error(loaded.error);
  }
  const { order } = loaded;

  if (order.status === "CANCELLED") return;
  if (order.paymentStatus === "PAID" || order.status === "PAID") {
    throw new Error("سفارش پرداخت‌شده قابل حذف نیست.");
  }

  await connectToDatabase();

  // Restore stock if it had already been deducted (order was approved)
  if (order.status === "APPROVED") {
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stockKg: item.requestedKg } },
      );
    }
  }

  await Order.updateOne(
    { _id: order._id },
    { $set: { status: "CANCELLED" } },
  );

  await Payment.updateMany(
    { orderId: order._id, status: { $in: ["PENDING", "REJECTED"] } },
    { $set: { status: "CANCELLED" } },
  );

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/products");
  revalidatePath("/admin/payments");
}
