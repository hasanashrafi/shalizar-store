import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { calculateTierPrice } from "@/lib/pricing";
import { orderSubmissionSchema } from "@/lib/validations/checkout";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "بدنه درخواست باید JSON معتبر باشد." },
      { status: 400 },
    );
  }

  try {
    const validation = orderSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "اطلاعات سفارش نامعتبر است.",
          details: validation.error.format(),
        },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const { items, ...buyer } = validation.data;
    const orderItems = [];
    let totalWeightKg = 0;
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).lean();

      if (!product) {
        return NextResponse.json(
          { error: "یکی از محصولات سبد خرید پیدا نشد." },
          { status: 404 },
        );
      }

      const requestedKg =
        item.requestedKg && item.requestedKg > 0
          ? item.requestedKg
          : item.quantityBags * product.packageWeightKg;
      const bagsCount = Math.max(
        1,
        Math.ceil(requestedKg / product.packageWeightKg),
      );

      if (requestedKg < product.moqKg) {
        return NextResponse.json(
          {
            error: `حداقل سفارش «${product.title}» ${product.moqKg} کیلوگرم است.`,
          },
          { status: 400 },
        );
      }

      if (requestedKg > product.stockKg) {
        return NextResponse.json(
          { error: `موجودی «${product.title}» برای این سفارش کافی نیست.` },
          { status: 400 },
        );
      }

      if (product.tiers.length === 0) {
        return NextResponse.json(
          { error: `برای محصول «${product.title}» هنوز قیمتی ثبت نشده است.` },
          { status: 400 },
        );
      }

      const unitPrice = calculateTierPrice(
        requestedKg,
        product.tiers.map((tier) => ({
          minKg: tier.minKg,
          maxKg: tier.maxKg ?? null,
          pricePerKg: tier.pricePerKg,
        })),
      );
      const totalPrice = requestedKg * unitPrice;

      totalWeightKg += requestedKg;
      totalAmount += totalPrice;
      orderItems.push({
        productId: new Types.ObjectId(product._id),
        productTitle: product.title,
        productSlug: product.slug,
        caliber: product.caliber,
        origin: product.origin,
        packaging: product.packaging,
        packageWeightKg: product.packageWeightKg,
        bagsCount,
        requestedKg,
        unitPrice,
        totalPrice,
      });
    }

    const order = await Order.create({
      customerName: buyer.customerName,
      userPhone: buyer.userPhone,
      companyName: buyer.companyName || undefined,
      nationalId: buyer.nationalId || undefined,
      economicId: buyer.economicId || undefined,
      destinationCity: `${buyer.province} - ${buyer.destinationCity}`,
      deliveryAddress: buyer.address,
      shippingType: buyer.shippingType,
      warehouseName:
        buyer.shippingType === "CARRIER"
          ? buyer.carrierName || "باربری عمومی"
          : buyer.shippingType,
      notes: buyer.notes || undefined,
      items: orderItems,
      totalWeightKg,
      totalAmount,
      status: "PENDING",
    });

    return NextResponse.json(
      { success: true, orderId: order._id.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating MongoDB order:", error);
    return NextResponse.json(
      { error: "خطای سرور در ثبت سفارش. لطفاً دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}
