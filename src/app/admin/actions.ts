"use server";

import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  constantTimeStringEqual,
  createAdminSession,
  isAdminLoginConfigured,
  requireAdmin,
} from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { adminProductSchema } from "@/lib/validations/admin-product";
import { ORDER_STATUSES, type OrderStatus } from "@/models/Order";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Purchase from "@/models/Purchase";
import Payment from "@/models/Payment";
import CashFlow from "@/models/CashFlow";
import Expense, { type ExpenseCategory } from "@/models/Expense";
import Discount from "@/models/Discount";

export interface AdminActionState {
  error?: string;
  success?: string;
}

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formRawString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function formNumber(formData: FormData, key: string): number {
  const value = formString(formData, key);
  return value === "" ? Number.NaN : Number(value);
}

function optionalPercent(formData: FormData, key: string): number | null {
  const value = formString(formData, key);
  return value === "" ? null : Number(value);
}

function parseTiers(raw: string) {
  const rows = raw
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  return rows.map((row) => {
    const columns = row.split(",").map((column) => column.trim());
    if (columns.length !== 3) {
      return { minKg: Number.NaN, maxKg: Number.NaN, pricePerKg: Number.NaN };
    }

    return {
      minKg: Number(columns[0]),
      maxKg: columns[1] === "*" ? null : Number(columns[1]),
      pricePerKg: Number(columns[2]),
    };
  });
}

export async function loginAdmin(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!isAdminLoginConfigured()) {
    return {
      error:
        "ورود مدیر پیکربندی نشده است. متغیرهای راه‌اندازی را در فایل محیطی تنظیم کنید.",
    };
  }

  const expectedUsername = process.env.ADMIN_USERNAME!;
  const expectedPassword = process.env.ADMIN_PASSWORD!;
  const username = formString(formData, "username");
  const password = formRawString(formData, "password");

  if (
    username.length > 128 ||
    password.length > 256 ||
    !constantTimeStringEqual(username, expectedUsername) ||
    !constantTimeStringEqual(password, expectedPassword)
  ) {
    return { error: "نام کاربری یا رمز عبور نادرست است." };
  }

  await createAdminSession();
  redirect("/admin/orders");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const orderId = formString(formData, "orderId");
  const newStatus = formString(formData, "status");

  if (
    !isValidObjectId(orderId) ||
    !ORDER_STATUSES.includes(newStatus as OrderStatus)
  ) {
    throw new Error("شناسه سفارش یا وضعیت انتخاب‌شده معتبر نیست.");
  }

  await connectToDatabase();

  // Get the order first to check current status and items
  const order = await Order.findById(orderId);
  if (!order) throw new Error("سفارش موردنظر پیدا نشد.");

  const currentStatus = order.status;
  const isApproving = currentStatus === "PENDING" && newStatus === "APPROVED";

  // If approving, deduct stock from products
  if (isApproving) {
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`محصول ${item.productTitle} در انبار یافت نشد.`);
      }
      if (product.stockKg < item.requestedKg) {
        throw new Error(
          `موجودی "${product.title}" برای تأیید سفارش کافی نیست (موجود: ${product.stockKg} کیلو، نیاز: ${item.requestedKg} کیلو).`,
        );
      }
      product.stockKg -= item.requestedKg;
      await product.save();
    }
  }

  // If cancelling an approved order, restore the deducted stock
  if (currentStatus === "APPROVED" && newStatus === "CANCELLED") {
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stockKg: item.requestedKg } },
      );
    }
  }

  const update: Record<string, unknown> = { status: newStatus as OrderStatus };

  // Keep payment status in sync when the admin marks the order paid directly
  if (newStatus === "PAID") {
    update.paymentStatus = "PAID";
  }

  await Order.updateOne({ _id: orderId }, { $set: update }, { runValidators: true });

  // Record the sale in cash-flow if it has not been recorded yet
  if (newStatus === "PAID" && order.paymentStatus !== "PAID") {
    const existing = await Payment.findOne({
      orderId: order._id,
      status: { $in: ["PAID", "CLEARED"] },
    }).lean();
    if (!existing) {
      await Payment.create({
        orderId: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        userPhone: order.userPhone,
        customerName: order.customerName,
        amount: order.totalAmount,
        method: "ONLINE",
        status: "PAID",
        gatewayRef: "MANUAL",
        transactionDate: new Date(),
        confirmedBy: "admin",
        confirmedAt: new Date(),
        notes: "ثبت دستی پرداخت توسط مدیر",
      });
    }
    await CashFlow.create({
      type: "SALE",
      amount: order.totalAmount,
      description: `فروش: سفارش ${orderId.slice(-8).toUpperCase()}`,
      referenceId: order._id,
      referenceModel: "Order",
      category: "SALE",
      paymentMethod: "BANK_TRANSFER",
      status: "COMPLETED",
      date: new Date(),
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/admin/products");
  revalidatePath("/admin/cash-flow");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/payments");
}

export async function createProduct(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  // Get file upload
  const imageFile = formData.get("imageFile") as File | null;
  let imageUrl: string | undefined;

  if (imageFile && imageFile.size > 0) {
    // Convert to base64 data URL for storage
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = imageFile.type;
    imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
  }

  // Build title from productType + origin + caliber
  const productType = formString(formData, "productType");
  const origin = formString(formData, "origin");
  const caliber = formString(formData, "caliber");

  const typeLabels: Record<string, string> = {
    beans: "لوبیا",
    chickpea: "نخود",
    lentils: "عدس",
    mash: "ماش",
    soybean: "سویا",
    cowpea: "لوبیا چتی",
    pinto: "لوبیا پینتو",
    red_kidney: "لوبیا قرمز",
    white_kidney: "لوبیا سفید",
    black_eyed_pea: "لوبیا چشمه",
    nabat: "نبات",
    sugar: "قند",
    raisin: "کشمش",
    barley: "جو",
    corn: "ذرت",
    tea: "چای",
    rice: "برنج",
    other: "سایر",
  };

  const originLabels: Record<string, string> = {
    iran: "ایران",
    canada: "کانادا",
    usa: "آمریکا",
    argentina: "آرژانتین",
    turkey: "ترکیه",
    russia: "روسیه",
    ukraine: "اوکراین",
    kazakhstan: "قزاقستان",
    china: "چین",
    other: "سایر",
  };

  const title = `${typeLabels[productType] || productType} ${originLabels[origin] || origin} ${caliber}`;

  // Parse tiers from the hidden field (already built by client)
  const tiers = parseTiers(formString(formData, "tiers"));

  // Purchase-related fields (auto-recorded into the purchases ledger)
  const supplierName = formString(formData, "supplierName");
  const supplierPhone = formString(formData, "supplierPhone");
  const purchaseDate = formString(formData, "purchaseDate");
  const purchasePaymentStatus = (formString(formData, "purchasePaymentStatus") ||
    "PAID") as "PENDING" | "PARTIAL" | "PAID";
  const purchasePaidAmount = formNumber(formData, "purchasePaidAmount");
  const invoiceNumber = formString(formData, "invoiceNumber");

  const validation = adminProductSchema.safeParse({
    productType,
    origin,
    caliber,
    slug: formString(formData, "slug"),
    basePrice: formNumber(formData, "basePrice"),
    purchasePricePerKg: formNumber(formData, "purchasePricePerKg"),
    wastePercent: optionalPercent(formData, "wastePercent"),
    moisturePercent: optionalPercent(formData, "moisturePercent"),
    packaging: formString(formData, "packaging"),
    packageWeightKg: formNumber(formData, "packageWeightKg"),
    moqKg: formNumber(formData, "moqKg"),
    stockKg: formNumber(formData, "stockKg"),
    imageUrl,
    tiers,
  });

  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message ?? "اطلاعات محصول معتبر نیست.",
    };
  }

  try {
    await connectToDatabase();
    const created = await Product.create({
      title,
      ...validation.data,
      imageUrl: validation.data.imageUrl || undefined,
    });

    // Record the incoming stock as a purchase (warehouse ledger)
    const stockKg = validation.data.stockKg;
    const unitCost = validation.data.purchasePricePerKg ?? 0;
    const packageWeightKg = validation.data.packageWeightKg;
    const totalWeightKg = stockKg;
    const bagsCount =
      packageWeightKg > 0 ? Math.round(stockKg / packageWeightKg) : 0;
    const totalCost = unitCost * stockKg;

    if (stockKg > 0) {
      const purchase = await Purchase.create({
        productId: created._id,
        productTitle: title,
        origin: originLabels[origin] || origin,
        caliber,
        packageWeightKg,
        bagsCount,
        totalWeightKg,
        unitCost,
        totalCost,
        supplierName: supplierName || "ثبت مستقیم انبار",
        supplierPhone: supplierPhone || undefined,
        invoiceNumber: invoiceNumber || undefined,
        invoiceDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        paymentStatus: purchasePaymentStatus,
        paidAmount: Number.isFinite(purchasePaidAmount) ? purchasePaidAmount : 0,
        notes: "ثبت خودکار همزمان با بار جدید انبار",
      });

      await CashFlow.create({
        type: "PURCHASE",
        amount: -totalCost,
        description: `خرید: ${title}`,
        referenceId: purchase._id,
        referenceModel: "Purchase",
        category: "PURCHASE",
        paymentMethod:
          purchasePaymentStatus === "PAID" ? "BANK_TRANSFER" : "OTHER",
        status: purchasePaymentStatus === "PAID" ? "COMPLETED" : "PENDING",
        date: purchaseDate ? new Date(purchaseDate) : new Date(),
      });
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return { error: "این شناسه محصول قبلاً ثبت شده است." };
    }
    console.error("Failed to create product from admin panel:", error);
    return { error: "ذخیره محصول انجام نشد. اتصال پایگاه‌داده را بررسی کنید." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/admin/cash-flow");
  revalidatePath("/admin/analytics");
  return { success: "کالا منتشر شد و خرید آن در انبار ثبت شد." };
}

export async function updateBasePrice(formData: FormData): Promise<void> {
  await requireAdmin();
  const productId = formString(formData, "productId");
  const newBasePrice = formNumber(formData, "basePrice");

  if (
    !isValidObjectId(productId) ||
    !Number.isFinite(newBasePrice) ||
    newBasePrice <= 0 ||
    newBasePrice > 1_000_000_000
  ) {
    throw new Error("شناسه محصول یا قیمت جدید معتبر نیست.");
  }

  await connectToDatabase();
  const product = await Product.findById(productId);
  if (!product) throw new Error("محصول موردنظر پیدا نشد.");

  const oldBasePrice = product.tiers[0]?.pricePerKg;
  if (!Number.isFinite(oldBasePrice) || oldBasePrice <= 0) {
    throw new Error("برای این محصول پلکان قیمت پایه ثبت نشده است.");
  }

  const priceDifference = newBasePrice - oldBasePrice;
  const updatedTiers = product.tiers.map((tier) => ({
    minKg: tier.minKg,
    maxKg: tier.maxKg,
    pricePerKg: Math.round(tier.pricePerKg + priceDifference),
  }));
  if (updatedTiers.some((tier) => tier.pricePerKg <= 0)) {
    throw new Error(
      "با این قیمت پایه، یکی از پلکان‌ها قیمت صفر یا منفی می‌گیرد.",
    );
  }
  product.tiers = updatedTiers;
  await product.save();

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath(`/products/${product.slug}`);
}

export async function updateProduct(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const productId = formString(formData, "productId");
  if (!isValidObjectId(productId)) {
    return { error: "شناسه محصول معتبر نیست." };
  }

  const caliber = formString(formData, "caliber");
  const packaging = formString(formData, "packaging");
  const packageWeightKg = formNumber(formData, "packageWeightKg");
  const moqKg = formNumber(formData, "moqKg");
  const stockKg = formNumber(formData, "stockKg");
  const basePrice = formNumber(formData, "basePrice");
  const purchasePricePerKg = formNumber(formData, "purchasePricePerKg");
  const wastePercent = optionalPercent(formData, "wastePercent");
  const moisturePercent = optionalPercent(formData, "moisturePercent");

  if (
    !caliber ||
    !packaging ||
    !Number.isFinite(packageWeightKg) ||
    packageWeightKg <= 0 ||
    !Number.isFinite(moqKg) ||
    moqKg <= 0 ||
    !Number.isFinite(stockKg) ||
    stockKg < 0 ||
    !Number.isFinite(basePrice) ||
    basePrice <= 0
  ) {
    return { error: "اطلاعات محصول معتبر نیست." };
  }

  await connectToDatabase();
  const product = await Product.findById(productId);
  if (!product) return { error: "محصول موردنظر پیدا نشد." };

  const imageFile = formData.get("imageFile") as File | null;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    product.imageUrl = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
  }

  const tier2 = Math.round(basePrice * 0.96);
  const tier3 = Math.round(basePrice * 0.91);

  product.caliber = caliber;
  product.packaging = packaging;
  product.packageWeightKg = packageWeightKg;
  product.moqKg = moqKg;
  product.stockKg = stockKg;
  product.purchasePricePerKg =
    Number.isFinite(purchasePricePerKg) && purchasePricePerKg >= 0
      ? purchasePricePerKg
      : undefined;
  product.wastePercent = wastePercent;
  product.moisturePercent = moisturePercent;
  product.tiers = [
    { minKg: 1, maxKg: 999, pricePerKg: basePrice },
    { minKg: 1000, maxKg: 2999, pricePerKg: tier2 },
    { minKg: 3000, maxKg: null, pricePerKg: tier3 },
  ];
  await product.save();

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/admin/analytics");

  return { success: "محصول با موفقیت ویرایش شد." };
}

// PAYMENTS (cheque confirmation by admin)

export async function updatePaymentStatus(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const paymentId = formString(formData, "paymentId");
  const action = formString(formData, "action");
  const rejectReason = formString(formData, "rejectReason");

  if (!isValidObjectId(paymentId)) {
    return { error: "شناسه پرداخت معتبر نیست." };
  }

  await connectToDatabase();
  const payment = await Payment.findById(paymentId);
  if (!payment) return { error: "پرداخت موردنظر پیدا نشد." };

  if (payment.status === "PAID" || payment.status === "CLEARED") {
    return { error: "این پرداخت قبلاً نهایی شده است." };
  }

  if (action === "CONFIRM") {
    payment.status = "CLEARED";
    payment.confirmedBy = "admin";
    payment.confirmedAt = new Date();
    await payment.save();

    const cashMethodMap: Record<
      string,
      "CASH" | "BANK_TRANSFER" | "CHECK" | "CARD" | "OTHER"
    > = {
      ONLINE: "CARD",
      BANK_TRANSFER: "BANK_TRANSFER",
      CHEQUE: "CHECK",
      CASH_ON_DELIVERY: "CASH",
    };
    const methodLabelMap: Record<string, string> = {
      ONLINE: "پرداخت اینترنتی",
      BANK_TRANSFER: "واریز بانکی",
      CHEQUE: "چک",
      CASH_ON_DELIVERY: "نقدی",
    };

    await Order.updateOne(
      { _id: payment.orderId },
      { $set: { paymentStatus: "PAID", status: "PAID" } },
    );

    const alreadyRecorded = await CashFlow.findOne({
      referenceId: payment.orderId,
      referenceModel: "Order",
      type: "SALE",
    }).lean();
    if (!alreadyRecorded) {
      await CashFlow.create({
        type: "SALE",
        amount: payment.amount,
        description: `فروش (تسویه ${methodLabelMap[payment.method] ?? "پرداخت"}): سفارش ${payment.orderNumber}`,
        referenceId: payment.orderId,
        referenceModel: "Order",
        category: "SALE",
        paymentMethod: cashMethodMap[payment.method] ?? "OTHER",
        status: "COMPLETED",
        date: new Date(),
      });
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/analytics");
    revalidatePath("/admin/cash-flow");
    revalidatePath(`/orders/${payment.orderId.toString()}`);
    return {
      success: `${methodLabelMap[payment.method] ?? "پرداخت"} تأیید و تسویه شد.`,
    };
  }

  if (action === "REJECT" || action === "BOUNCE") {
    payment.status = action === "BOUNCE" ? "BOUNCED" : "REJECTED";
    payment.rejectReason = rejectReason || undefined;
    await payment.save();

    const order = await Order.findById(payment.orderId).lean();
    if (order && order.paymentStatus !== "PAID") {
      await Order.updateOne(
        { _id: payment.orderId },
        { $set: { paymentStatus: "REJECTED" } },
      );
    }

    revalidatePath("/admin/payments");
    revalidatePath(`/orders/${payment.orderId.toString()}`);
    return {
      success:
        action === "BOUNCE"
          ? "برگشتی ثبت شد."
          : "پرداخت رد شد.",
    };
  }

  return { error: "عملیات نامعتبر است." };
}

// EXPENSES

export async function createExpense(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const title = formString(formData, "title");
  const description = formString(formData, "description");
  const amount = formNumber(formData, "amount");
  const category = formString(formData, "category") as ExpenseCategory;
  const paymentMethod = formString(formData, "paymentMethod") as "CASH" | "BANK_TRANSFER" | "CHECK" | "CARD" | "OTHER";
  const paymentStatus = formString(formData, "paymentStatus") as "PENDING" | "PAID" | "PARTIAL";
  const paidAmount = formNumber(formData, "paidAmount");
  const vendorName = formString(formData, "vendorName");
  const vendorPhone = formString(formData, "vendorPhone");
  const invoiceNumber = formString(formData, "invoiceNumber");
  const invoiceDate = formString(formData, "invoiceDate");
  const dueDate = formString(formData, "dueDate");
  const notes = formString(formData, "notes");

  if (!title || !Number.isFinite(amount) || !category || !paymentMethod) {
    return { error: "فیلدهای ضروری را پر کنید." };
  }

  try {
    await connectToDatabase();
    const expense = await Expense.create({
      title,
      description: description || undefined,
      amount,
      category,
      paymentMethod,
      paymentStatus: paymentStatus || "PENDING",
      paidAmount: Number.isFinite(paidAmount) ? paidAmount : 0,
      vendorName: vendorName || undefined,
      vendorPhone: vendorPhone || undefined,
      invoiceNumber: invoiceNumber || undefined,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes: notes || undefined,
    });

    await CashFlow.create({
      type: "EXPENSE",
      amount: -amount,
      description: `هزینه: ${title}`,
      referenceId: expense._id,
      referenceModel: "Expense",
      category,
      paymentMethod,
      status: paymentStatus === "PAID" ? "COMPLETED" : "PENDING",
      date: new Date(),
      notes: notes || undefined,
    });
  } catch (error) {
    console.error("Failed to create expense:", error);
    return { error: "ثبت هزینه انجام نشد." };
  }

  revalidatePath("/admin/expenses");
  revalidatePath("/admin/cash-flow");
  return { success: "هزینه با موفقیت ثبت شد." };
}

// DISCOUNTS

export async function createDiscount(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const name = formString(formData, "name");
  const description = formString(formData, "description");
  const type = formString(formData, "type") as "VOLUME" | "PERCENTAGE" | "FIXED_AMOUNT" | "TIERED";
  const scope = formString(formData, "scope") as "GLOBAL" | "PRODUCT" | "CATEGORY";
  const productIdsRaw = formString(formData, "productIds");
  const category = formString(formData, "category");
  const startDate = formString(formData, "startDate");
  const endDate = formString(formData, "endDate");
  const usageLimit = formNumber(formData, "usageLimit");
  const tiersRaw = formString(formData, "tiers");

  if (!name || !type || !scope || !startDate) {
    return { error: "فیلدهای ضروری را پر کنید." };
  }

  const productIds = productIdsRaw ? productIdsRaw.split(",").map((id) => id.trim()).filter(Boolean) : [];

  const tiers = tiersRaw
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [minQty, maxQty, value, discType] = row.split(",").map((c) => c.trim());
      return {
        minQuantity: Number(minQty),
        maxQuantity: maxQty && maxQty !== "*" ? Number(maxQty) : null,
        discountValue: Number(value),
        discountType: discType as "PERCENTAGE" | "FIXED_AMOUNT",
      };
    })
    .filter((t) => Number.isFinite(t.minQuantity) && Number.isFinite(t.discountValue));

  if (tiers.length === 0) {
    return { error: "حداقل یک پلکان تخفیف تعریف کنید." };
  }

  try {
    await connectToDatabase();
    await Discount.create({
      name,
      description: description || undefined,
      type,
      scope,
      productIds: productIds.length > 0 ? productIds : undefined,
      category: category || undefined,
      tiers,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      usageLimit: Number.isFinite(usageLimit) ? usageLimit : null,
    });
  } catch (error) {
    console.error("Failed to create discount:", error);
    return { error: "ثبت تخفیف انجام نشد." };
  }

  revalidatePath("/admin/discounts");
  return { success: "تخفیف با موفقیت ثبت شد." };
}

export async function toggleDiscountStatus(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const discountId = formString(formData, "discountId");
  if (!isValidObjectId(discountId)) return { error: "شناسه تخفیف معتبر نیست." };

  await connectToDatabase();
  const discount = await Discount.findById(discountId);
  if (!discount) return { error: "تخفیف موردنظر پیدا نشد." };

  discount.isActive = !discount.isActive;
  await discount.save();

  revalidatePath("/admin/discounts");
  return { success: `تخفیف ${discount.isActive ? "فعال" : "غیرفعال"} شد.` };
}
