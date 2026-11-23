import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectToDatabase();
  const articles = await Article.find({ isPublished: true })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json(
    articles.map((a) => ({
      id: a._id.toString(),
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      coverImage: a.coverImage ?? null,
      author: a.author ?? null,
      category: a.category ?? null,
      publishedAt: a.publishedAt ?? a.createdAt,
    })),
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const article = await Article.create({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content || "",
      coverImage: body.coverImage || null,
      author: body.author || null,
      category: body.category || null,
      isPublished: body.isPublished !== false,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
    });
    return NextResponse.json({
      id: article._id.toString(),
      title: article.title,
      slug: article.slug,
    });
  } catch {
    return NextResponse.json(
      { error: "could not create article" },
      { status: 500 },
    );
  }
}
