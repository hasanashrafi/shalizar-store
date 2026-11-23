import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";

export const runtime = "nodejs";

interface SeedProduct {
  title: string;
  slug: string;
  origin: string;
  caliber: string;
  packaging: string;
  packageWeightKg: number;
  moqKg: number;
  stockKg: number;
  purchasePricePerKg: number;
  imageUrl: string;
  tiers: Array<{ minKg: number; maxKg?: number; pricePerKg: number }>;
}

function tiers(base: number, moq: number) {
  return [
    { minKg: moq, maxKg: moq * 3 - 1, pricePerKg: base },
    { minKg: moq * 3, maxKg: moq * 9 - 1, pricePerKg: Math.round(base * 0.95) },
    { minKg: moq * 9, pricePerKg: Math.round(base * 0.9) },
  ];
}

const sampleProducts: SeedProduct[] = [
  {
    title: "لوبیا چیتی درجه یک خمین",
    slug: "pinto-beans-grade-1",
    origin: "خمین، ایران",
    caliber: "درشت، دستچین",
    packaging: "کیسه ۳۰ کیلویی",
    packageWeightKg: 30,
    moqKg: 300,
    stockKg: 12000,
    purchasePricePerKg: 118000,
    imageUrl: "/images/products/p1.png",
    tiers: tiers(145000, 300),
  },
  {
    title: "لوبیا قرمز درجه یک",
    slug: "red-beans-grade-1",
    origin: "لرستان، ایران",
    caliber: "درشت، سورت‌شده",
    packaging: "کیسه ۳۰ کیلویی",
    packageWeightKg: 30,
    moqKg: 300,
    stockKg: 9000,
    purchasePricePerKg: 102000,
    imageUrl: "/images/products/p2.png",
    tiers: tiers(128000, 300),
  },
  {
    title: "لوبیا سفید درشت",
    slug: "white-beans-large",
    origin: "کرمانشاه، ایران",
    caliber: "درشت، دستچین",
    packaging: "کیسه ۲۵ کیلویی",
    packageWeightKg: 25,
    moqKg: 250,
    stockKg: 7500,
    purchasePricePerKg: 115000,
    imageUrl: "/images/products/p3.png",
    tiers: tiers(142000, 250),
  },
  {
    title: "نخود کرمانشاه ۹ دست",
    slug: "kermanshah-chickpeas",
    origin: "کرمانشاه، ایران",
    caliber: "۹ دستچین",
    packaging: "کیسه ۳۰ کیلویی",
    packageWeightKg: 30,
    moqKg: 300,
    stockKg: 15000,
    purchasePricePerKg: 74000,
    imageUrl: "/images/products/p4.png",
    tiers: tiers(92000, 300),
  },
  {
    title: "نخود زرد صادراتی",
    slug: "yellow-chickpeas-export",
    origin: "کرمانشاه، ایران",
    caliber: "۷ دست، صادراتی",
    packaging: "کیسه ۲۵ کیلویی",
    packageWeightKg: 25,
    moqKg: 250,
    stockKg: 11000,
    purchasePricePerKg: 82000,
    imageUrl: "/images/products/p5.png",
    tiers: tiers(101000, 250),
  },
  {
    title: "عدس کانادایی درشت",
    slug: "canadian-lentils",
    origin: "کانادا",
    caliber: "درشت، سورت‌شده",
    packaging: "کیسه ۲۵ کیلویی",
    packageWeightKg: 25,
    moqKg: 250,
    stockKg: 20000,
    purchasePricePerKg: 88000,
    imageUrl: "/images/products/p6.png",
    tiers: tiers(105000, 250),
  },
  {
    title: "عدس قرمز سرتاه",
    slug: "red-split-lentils",
    origin: "کانادا",
    caliber: "سرتاه، بدون پوست",
    packaging: "کیسه ۲۵ کیلویی",
    packageWeightKg: 25,
    moqKg: 250,
    stockKg: 13000,
    purchasePricePerKg: 95000,
    imageUrl: "/images/products/p7.png",
    tiers: tiers(118000, 250),
  },
  {
    title: "ماش سبز درجه یک",
    slug: "green-mung-beans",
    origin: "ازبکستان",
    caliber: "درشت، دستچین",
    packaging: "کیسه ۲۵ کیلویی",
    packageWeightKg: 25,
    moqKg: 250,
    stockKg: 8000,
    purchasePricePerKg: 132000,
    imageUrl: "/images/products/p8.png",
    tiers: tiers(162000, 250),
  },
  {
    title: "لپه زرد ایرانی",
    slug: "yellow-split-peas",
    origin: "لرستان، ایران",
    caliber: "بلغور متوسط",
    packaging: "کیسه ۳۰ کیلویی",
    packageWeightKg: 30,
    moqKg: 300,
    stockKg: 6500,
    purchasePricePerKg: 68000,
    imageUrl: "/images/products/p9.png",
    tiers: tiers(86000, 300),
  },
  {
    title: "لوبیا عروس درشت",
    slug: "borlotti-beans",
    origin: "خمین، ایران",
    caliber: "درشت، راهراه",
    packaging: "کیسه ۲۰ کیلویی",
    packageWeightKg: 20,
    moqKg: 200,
    stockKg: 4200,
    purchasePricePerKg: 148000,
    imageUrl: "/images/products/p10.png",
    tiers: tiers(182000, 200),
  },
  {
    title: "نخود فرنگی خشک",
    slug: "dried-peas",
    origin: "روسیه",
    caliber: "درشت، سورت‌شده",
    packaging: "کیسه ۲۵ کیلویی",
    packageWeightKg: 25,
    moqKg: 250,
    stockKg: 10000,
    purchasePricePerKg: 58000,
    imageUrl: "/images/products/p11.png",
    tiers: tiers(72000, 250),
  },
  {
    title: "لوبیا چشمبلبلی",
    slug: "black-eyed-peas",
    origin: "آفریقای جنوبی",
    caliber: "درشت، دستچین",
    packaging: "کیسه ۲۵ کیلویی",
    packageWeightKg: 25,
    moqKg: 250,
    stockKg: 5600,
    purchasePricePerKg: 96000,
    imageUrl: "/images/products/p12.png",
    tiers: tiers(121000, 250),
  },
  {
    title: "سویا دانه درشت",
    slug: "soybean-large",
    origin: "برزیل",
    caliber: "درشت، پاک",
    packaging: "کیسه ۴۰ کیلویی",
    packageWeightKg: 40,
    moqKg: 400,
    stockKg: 18000,
    purchasePricePerKg: 42000,
    imageUrl: "/images/products/p13.png",
    tiers: tiers(54000, 400),
  },
  {
    title: "نخود سیاه گرد",
    slug: "black-chickpeas",
    origin: "ترکیه",
    caliber: "گرد، متوسط",
    packaging: "کیسه ۲۵ کیلویی",
    packageWeightKg: 25,
    moqKg: 250,
    stockKg: 3800,
    purchasePricePerKg: 78000,
    imageUrl: "/images/products/p14.png",
    tiers: tiers(98000, 250),
  },
  {
    title: "لوبیا کپسولی درشت",
    slug: "navy-beans",
    origin: "کانادا",
    caliber: "درشت، سورت‌شده",
    packaging: "کیسه ۲۵ کیلویی",
    packageWeightKg: 25,
    moqKg: 250,
    stockKg: 7200,
    purchasePricePerKg: 108000,
    imageUrl: "/images/products/p15.png",
    tiers: tiers(134000, 250),
  },
  {
    title: "عدس سبز فرانسوی",
    slug: "green-lentils",
    origin: "فرانسه",
    caliber: "ریز، سورت‌شده",
    packaging: "کیسه ۲۵ کیلویی",
    packageWeightKg: 25,
    moqKg: 250,
    stockKg: 6900,
    purchasePricePerKg: 112000,
    imageUrl: "/images/products/p16.png",
    tiers: tiers(139000, 250),
  },
];

function isAuthorized(request: Request, secret: string): boolean {
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!provided) return false;

  const expectedBuffer = Buffer.from(secret);
  const providedBuffer = Buffer.from(provided);

  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

export async function POST(request: Request) {
  const seedSecret = process.env.SEED_SECRET;

  if (!seedSecret || seedSecret.length < 32) {
    return NextResponse.json(
      { error: "SEED_SECRET must be configured with at least 32 characters." },
      { status: 503 },
    );
  }

  if (!isAuthorized(request, seedSecret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const slugs = sampleProducts.map((product) => product.slug);
    await Product.deleteMany({ slug: { $in: slugs } });
    const insertedProducts = await Product.insertMany(sampleProducts);

    return NextResponse.json({
      success: true,
      count: insertedProducts.length,
      message: "Sample products were seeded. Other catalog products were preserved.",
    });
  } catch (error) {
    console.error("Failed to seed sample products:", error);
    return NextResponse.json(
      { error: "Could not seed sample products." },
      { status: 500 },
    );
  }
}