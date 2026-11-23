import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Article from "@/models/Article";

export const runtime = "nodejs";

const sampleArticles = [
  {
    title: "راهنمای خرید عمده لوبیا و نخود: چه نکاتی را باید دانست؟",
    slug: "guide-bulk-legumes-purchase",
    excerpt:
      "بهترین روش‌های انتخاب لوبیا و نخود با کیفیت، بررسی کالیبر، ضایعات و رطوبت، و محاسبه قیمت پلکانی بر اساس تناژ.",
    content:
      "در این مقاله به مرور نکات مهم خرید عمده لوبیا و نخود می‌پردازیم. ابتدا بررسی می‌کنیم که کالیبر دانه چیست و چگونه بر قیمت تأثیر می‌گذارد، سپس ضایعات و رطوبت بار را بررسی می‌کنیم و در نهایت چگونه قیمت بر اساس وزن سفارش محاسبه شود را توضیح می‌دهیم.\n\nپس از مطالعه این مقاله، می‌توانید با اطمینان بیشتر سفارش عمده‌تان را ثبت کنید.",
    coverImage: null,
    author: "بازرگانی شالیزار",
    category: "راهنمای خرید",
    isPublished: true,
    publishedAt: new Date("2024-01-15"),
  },
  {
    title: "تفاوت لوبیا ایرانی و وارداتی: کدام یک بهتر است؟",
    slug: "iranian-vs-imported-beans",
    excerpt:
      "مقایسه کیفیت لوبیا تولید داخل و لوبیا وارداتی از نظر طعم، کالیبر، قیمت و زمان تحویل.",
    content:
      "در این مقاله، لوبیا ایرانی و لوبیا وارداتی را از نظر کیفیت، طعم، کالیبر، قیمت و زمان بارگیری مقایسه می‌کنیم تا بهترین انتخاب برای سفارش عمده‌تان را انجام دهید.\n\nسال لوبیا ایرانی معمولاً تازه‌تر است و زمان بارگیری کمتر دارد، در حالی که لوبیا وارداتی ممکن است قیمت بهتری در تناژهای بسیار بزرگ داشته باشد.",
    coverImage: null,
    author: "بازرگانی شالیزار",
    category: "مقایسه محصول",
    isPublished: true,
    publishedAt: new Date("2024-02-10"),
  },
  {
    title: "چگونه قیمت پلکانی حبوبات را محاسبه کنیم؟",
    slug: "how-to-calculate-tier-pricing",
    excerpt:
      "شرحی از نحوه عملکرد پلکان قیمت بر اساس وزن سفارش و نحوه کاهش قیمت با افزایش تناژ.",
    content:
      "در بازرگانی شالیزار، قیمت هر کیلو محصول بر اساس وزن کل سفارش (تناژ) تغییر می‌کند. این مکانیزم به نام پلکان قیمت (tier pricing) است. در این مقاله به توضیح این سیستم می‌پردازیم و مثال‌هایی از محاسبه قیمت نهایی می‌دهیم.\n\nبه عنوان مثال، لوبیا چیتی برای ۳۰۰ تا ۹۹۹ کیلو قیمت ۱۴۵۰۰۰ تومان است، اما برای ۳۰۰۰ کیلو به بالا قیمت ۱۳۲۰۰۰ تومان می‌شود.",
    coverImage: null,
    author: "بازرگانی شالیزار",
    category: "آموزش فنی",
    isPublished: true,
    publishedAt: new Date("2024-03-05"),
  },
];

export async function POST(_request: Request) {
  try {
    await connectToDatabase();

    const slugs = sampleArticles.map((a) => a.slug);
    await Article.deleteMany({ slug: { $in: slugs } });
    const inserted = await Article.insertMany(
      sampleArticles.map((a) => ({
        ...a,
        publishedAt: new Date(a.publishedAt),
      })),
    );

    return NextResponse.json({
      success: true,
      count: inserted.length,
      message: "Sample articles seeded.",
    });
  } catch (error) {
    console.error("Failed to seed articles:", error);
    return NextResponse.json(
      { error: "Could not seed articles." },
      { status: 500 },
    );
  }
}
