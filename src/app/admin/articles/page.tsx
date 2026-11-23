
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import Article from "@/models/Article";
import ArticlesManager, { type AdminArticle } from "./ArticlesManager";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  await requireAdmin();
  await connectToDatabase();

  const articles = await Article.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const list: AdminArticle[] = articles.map((a) => ({
    id: a._id.toString(),
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
    coverImage: a.coverImage ?? null,
    author: a.author ?? null,
    category: a.category ?? null,
    isPublished: a.isPublished,
    publishedAt: a.publishedAt
      ? new Date(a.publishedAt).toISOString()
      : null,
  }));

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">

        <ArticlesManager articles={list} />
      </div>
    </main>
  );
}