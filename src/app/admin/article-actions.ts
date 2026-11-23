"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import Article from "@/models/Article";

export interface ArticleActionState {
  error?: string;
  success?: string;
}

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || !Number.isNaN(new Date(value).getTime()),
    "تاریخ نامعتبر است.",
  );

const articleSchema = z.object({
  articleId: z.string().optional(),
  title: z.string().trim().min(3, "عنوان مقاله را وارد کنید.").max(200),
  slug: z.string().trim().max(200).optional(),
  excerpt: z.string().trim().min(10, "خلاصه مقاله را وارد کنید.").max(500),
  content: z.string().trim().min(10, "متن مقاله را وارد کنید."),
  coverImage: z.string().trim().max(500).optional(),
  author: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  isPublished: z.boolean(),
  publishedAt: optionalDate,
});

function slugify(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .toLowerCase()
    .slice(0, 190);
}

function revalidateArticles() {
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/");
}

export async function createArticle(
  _previousState: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  await requireAdmin();

  const parsed = articleSchema.safeParse({
    title: formData.get("title") ?? "",
    slug: formData.get("slug") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content") ?? "",
    coverImage: formData.get("coverImage") ?? "",
    author: formData.get("author") ?? "",
    category: formData.get("category") ?? "",
    isPublished: formData.get("isPublished") === "true",
    publishedAt: formData.get("publishedAt") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات مقاله نامعتبر است." };
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.title);
  if (!slug) {
    return { error: "عنوان مقاله برای ساخت اسلاگ کافی نیست." };
  }

  await connectToDatabase();

  const existing = await Article.findOne({ slug }).lean();
  if (existing) {
    return { error: "مقاله‌ای با این اسلاگ (نامک) از قبل وجود دارد." };
  }

  const publishedAt = data.isPublished
    ? data.publishedAt
      ? new Date(data.publishedAt)
      : new Date()
    : null;

  await Article.create({
    title: data.title,
    slug,
    excerpt: data.excerpt,
    content: data.content,
    coverImage: data.coverImage || null,
    author: data.author || "بازرگانی شالیزار",
    category: data.category || null,
    isPublished: data.isPublished,
    publishedAt,
  });

  revalidateArticles();
  return { success: "مقاله با موفقیت ثبت شد." };
}

export async function updateArticle(
  _previousState: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  await requireAdmin();

  const parsed = articleSchema.safeParse({
    articleId: formData.get("articleId") ?? "",
    title: formData.get("title") ?? "",
    slug: formData.get("slug") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content") ?? "",
    coverImage: formData.get("coverImage") ?? "",
    author: formData.get("author") ?? "",
    category: formData.get("category") ?? "",
    isPublished: formData.get("isPublished") === "true",
    publishedAt: formData.get("publishedAt") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات مقاله نامعتبر است." };
  }

  const data = parsed.data;
  if (!data.articleId || !isValidObjectId(data.articleId)) {
    return { error: "شناسه مقاله معتبر نیست." };
  }

  await connectToDatabase();
  const article = await Article.findById(data.articleId);
  if (!article) return { error: "مقاله موردنظر پیدا نشد." };

  const slug = slugify(data.slug || data.title);
  if (!slug) {
    return { error: "عنوان مقاله برای ساخت اسلاگ کافی نیست." };
  }

  if (slug !== article.slug) {
    const duplicate = await Article.findOne({ slug, _id: { $ne: article._id } }).lean();
    if (duplicate) {
      return { error: "مقاله‌ای با این اسلاگ (نامک) از قبل وجود دارد." };
    }
  }

  const publishedAt = data.isPublished
    ? article.publishedAt ?? (data.publishedAt ? new Date(data.publishedAt) : new Date())
    : null;

  article.title = data.title;
  article.slug = slug;
  article.excerpt = data.excerpt;
  article.content = data.content;
  article.coverImage = data.coverImage || null;
  article.author = data.author || "بازرگانی شالیزار";
  article.category = data.category || null;
  article.isPublished = data.isPublished;
  article.publishedAt = publishedAt;
  await article.save();

  revalidateArticles();
  revalidatePath(`/articles/${article.slug}`);
  return { success: "تغییرات مقاله ذخیره شد." };
}

export async function toggleArticlePublish(formData: FormData): Promise<void> {
  await requireAdmin();
  const articleId = String(formData.get("articleId") ?? "");
  if (!isValidObjectId(articleId)) throw new Error("شناسه مقاله معتبر نیست.");

  await connectToDatabase();
  const article = await Article.findById(articleId);
  if (!article) throw new Error("مقاله موردنظر پیدا نشد.");

  article.isPublished = !article.isPublished;
  article.publishedAt = article.isPublished
    ? article.publishedAt ?? new Date()
    : null;
  await article.save();

  revalidateArticles();
  revalidatePath(`/articles/${article.slug}`);
}

export async function deleteArticle(formData: FormData): Promise<void> {
  await requireAdmin();
  const articleId = String(formData.get("articleId") ?? "");
  if (!isValidObjectId(articleId)) throw new Error("شناسه مقاله معتبر نیست.");

  await connectToDatabase();
  await Article.deleteOne({ _id: articleId });

  revalidateArticles();
}