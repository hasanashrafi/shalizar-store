import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { connectToDatabase } from "@/lib/mongodb";
import ArticleModel from "@/models/Article";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  author?: string | null;
  category?: string | null;
  publishedAt: Date;
}

async function getArticleBySlug(slug: string): Promise<Article | null> {
  await connectToDatabase();
  const article = await ArticleModel.findOne({ slug, isPublished: true }).lean();
  if (!article) return null;

  return {
    id: article._id.toString(),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    coverImage: article.coverImage ?? null,
    author: article.author ?? null,
    category: article.category ?? null,
    publishedAt: article.publishedAt ?? article.createdAt,
  };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function ArticleDetailPage({
  params,
}: ArticlePageProps) {
  const resolvedParams = await params;
  const article = await getArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <Link href="/" className="transition-colors hover:text-emerald-900">
            صفحه اصلی
          </Link>
          <span>/</span>
          <Link
            href="/articles"
            className="transition-colors hover:text-emerald-900"
          >
            مجله شالیزار
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#1C1917]">{article.title}</span>
        </nav>

        <div className="relative mb-8 h-64 overflow-hidden rounded-3xl bg-stone-100 shadow-sm sm:h-[380px]">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#FAF8F5] to-stone-200 text-sm font-semibold text-stone-500">
              تصویر مقاله
            </div>
          )}
          {article.category && (
            <span className="absolute right-4 top-4 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
              {article.category}
            </span>
          )}
        </div>

            <h1 className="mb-3 text-xl font-black leading-tight tracking-tight text-[#1C1917] sm:mb-4 sm:text-2xl lg:text-3xl">
          {article.title}
        </h1>
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-stone-500">
          <time className="flex items-center gap-1">
            <span aria-hidden="true">📅</span>
            {formatDate(article.publishedAt)}
          </time>
          {article.author && (
            <span className="flex items-center gap-1">
              <span aria-hidden="true">✍️</span>
              {article.author}
            </span>
          )}
        </div>

        <div className="max-w-none leading-8 text-stone-700">
          <p className="mb-6 rounded-2xl border border-[#E7E5E4] bg-white p-5 text-base font-bold text-[#1C1917] shadow-sm">
            {article.excerpt}
          </p>
          {article.content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="mb-6">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[#E7E5E4] bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-[#1C1917]">
            علاقه‌مند به خرید عمده هستید؟
          </h2>
          <p className="mb-4 text-sm text-stone-600">
            کاتالوگ بارهای آماده شالیزار را ببینید و پیش‌فاکتور خود را ثبت کنید.
          </p>
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-600 px-5 text-sm font-bold text-white transition hover:bg-amber-700"
          >
            مشاهده کاتالوگ محصولات
          </Link>
        </div>
      </div>
    </main>
  );
}