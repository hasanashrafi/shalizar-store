import Link from "next/link";
import Image from "next/image";
import { connectToDatabase } from "@/lib/mongodb";
import ArticleModel from "@/models/Article";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
  author?: string | null;
  category?: string | null;
  publishedAt: Date;
}

export const dynamic = "force-dynamic";

async function getArticles(): Promise<Article[]> {
  await connectToDatabase();
  const articles = await ArticleModel.find({ isPublished: true })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(50)
    .lean();

  return articles.map((a) => ({
    id: a._id.toString(),
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    coverImage: a.coverImage ?? null,
    author: a.author ?? null,
    category: a.category ?? null,
    publishedAt: a.publishedAt ?? a.createdAt,
  }));
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-3 border-b border-[#E7E5E4] pb-6 sm:mb-10 sm:pb-8">
          <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900">
            مجله شالیزار
          </span>
          <h1 className="text-xl font-black tracking-tight text-[#1C1917] sm:text-2xl lg:text-3xl">
            مقالات و اخبار بازار حبوبات
          </h1>
          <p className="text-sm leading-7 text-stone-600">
            نوشته‌های آموزشی، اخبار بازار حبوبات و راهنمای خرید عمده.
          </p>
        </header>

        {articles.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-[#E7E5E4] bg-white p-8 text-center shadow-sm sm:p-16">
            <h2 className="text-xl font-bold text-[#1C1917]">
              مقاله‌ای انتشار نیافته است
            </h2>
            <p className="mt-3 text-sm text-stone-500">
              به‌زودی مقالات مهمی در اینجا منتشر می‌شود.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E7E5E4] bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-amber-200 hover:shadow-md"
              >
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#FAF8F5] to-stone-200 text-sm font-semibold text-stone-500">
                      تصویر مقاله
                    </div>
                  )}
                  {article.category && (
                    <span className="absolute right-3 top-3 rounded-lg bg-rose-700 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                      {article.category}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="mb-2 line-clamp-2 text-base font-extrabold text-[#1C1917] transition-colors group-hover:text-emerald-900">
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                  </h2>
                  <p className="mb-4 line-clamp-3 flex-1 text-sm leading-7 text-stone-600">
                    {article.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 border-t border-[#E7E5E4] pt-4 text-xs text-stone-500">
                    <span>{formatDate(article.publishedAt)}</span>
                    {article.author && <span>· {article.author}</span>}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}