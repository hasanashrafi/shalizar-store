import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";

export const runtime = "nodejs";

const MAX_WISHLIST_ITEMS = 100;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawIds = searchParams.get("ids") ?? "";
  if (rawIds.length > MAX_WISHLIST_ITEMS * 25) {
    return NextResponse.json(
      { error: "تعداد شناسه‌های علاقه‌مندی بیش از حد مجاز است." },
      { status: 400 },
    );
  }
  const ids = [...new Set(rawIds.split(",").filter(Boolean))];

  if (
    ids.length > MAX_WISHLIST_ITEMS ||
    ids.some((id) => !isValidObjectId(id))
  ) {
    return NextResponse.json(
      { error: "شناسه محصولات معتبر نیست." },
      { status: 400 },
    );
  }

  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  try {
    await connectToDatabase();
    const products = await Product.find({ _id: { $in: ids } })
      .select(
        "_id title slug origin caliber packaging packageWeightKg moqKg stockKg imageUrl tiers",
      )
      .lean();

    return NextResponse.json({
      products: products.map((product) => ({
        id: product._id.toString(),
        title: product.title,
        slug: product.slug,
        origin: product.origin,
        caliber: product.caliber,
        packaging: product.packaging,
        packageWeightKg: product.packageWeightKg,
        moqKg: product.moqKg,
        stockKg: product.stockKg,
        imageUrl: product.imageUrl ?? null,
        tiers: product.tiers.map((tier) => ({
          minKg: tier.minKg,
          maxKg: tier.maxKg ?? null,
          pricePerKg: tier.pricePerKg,
        })),
      })),
    });
  } catch (error) {
    console.error("Failed to load wishlist products:", error);
    return NextResponse.json(
      { error: "بارگیری علاقه‌مندی‌ها انجام نشد." },
      { status: 500 },
    );
  }
}
