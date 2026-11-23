"use client";

import Link from "next/link";
import { useState } from "react";
import {
  toggleArticlePublish,
  deleteArticle,
} from "@/app/admin/article-actions";
import ArticleForm, { type EditableArticle } from "./ArticleForm";

export interface AdminArticle extends EditableArticle {
  id: string;
}

interface ArticlesManagerProps {
  articles: AdminArticle[];
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default function ArticlesManager({ articles }: ArticlesManagerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingArticle = articles.find((a) => a.id === editingId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#1C1917] sm:text-2xl">
            مقالات و مجله شالیزار
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {articles.length.toLocaleString("fa-IR")} مقاله ·{" "}
            {articles.filter((a) => a.isPublished).length.toLocaleString("fa-IR")}{" "}
            منتشرشده
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowCreate((v) => !v);
            setEditingId(null);
          }}
          className="min-h-11 rounded-xl bg-amber-600 px-5 text-sm font-bold text-white transition hover:bg-amber-700"
        >
          {showCreate ? "بستن فرم" : "+ مقاله جدید"}
        </button>
      </div>

      {showCreate && (
        <ArticleForm onDone={() => setShowCreate(false)} />
      )}

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E7E5E4] bg-white p-8 text-center sm:p-12">
          <p className="text-stone-500">هنوز مقاله‌ای ثبت نشده است.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {articles.map((article) => {
            const isEditing = editingId === article.id;
            return (
              <li
                key={article.id}
                className="rounded-2xl border border-[#E7E5E4] bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          article.isPublished
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {article.isPublished ? "منتشرشده" : "پیش‌نویس"}
                      </span>
                      <span className="font-mono text-xs text-stone-400" dir="ltr">
                        {article.slug}
                      </span>
                    </div>
                    <h2 className="mt-2 line-clamp-1 font-extrabold text-[#1C1917]">
                      {article.title}
                    </h2>
                    <p className="mt-1 line-clamp-1 text-xs text-stone-500">
                      {article.excerpt}
                    </p>
                    <p className="mt-1 text-[11px] text-stone-400">
                      تاریخ انتشار: {formatDate(article.publishedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {article.isPublished && (
                      <Link
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        className="inline-flex min-h-9 items-center rounded-lg border border-stone-300 bg-white px-3 text-xs font-bold text-stone-700 transition hover:bg-stone-50"
                      >
                        مشاهده
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(isEditing ? null : article.id);
                        setShowCreate(false);
                      }}
                      className="inline-flex min-h-9 items-center rounded-lg border border-stone-300 bg-white px-3 text-xs font-bold text-stone-700 transition hover:bg-stone-50"
                    >
                      {isEditing ? "بستن" : "ویرایش"}
                    </button>

                    <form action={toggleArticlePublish}>
                      <input type="hidden" name="articleId" value={article.id} />
                      <button
                        type="submit"
                        className={`inline-flex min-h-9 items-center rounded-lg px-3 text-xs font-bold text-white transition ${
                          article.isPublished
                            ? "bg-stone-500 hover:bg-stone-600"
                            : "bg-emerald-700 hover:bg-emerald-800"
                        }`}
                      >
                        {article.isPublished ? "لغو انتشار" : "انتشار"}
                      </button>
                    </form>

                    <form
                      action={deleteArticle}
                      onSubmit={(e) => {
                        if (
                          !window.confirm(
                            "آیا از حذف این مقاله مطمئن هستید؟ این عمل قابل بازگشت نیست.",
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="articleId" value={article.id} />
                      <button
                        type="submit"
                        className="inline-flex min-h-9 items-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                      >
                        حذف
                      </button>
                    </form>
                  </div>
                </div>

                {isEditing && editingArticle && (
                  <div className="mt-4 border-t border-[#E7E5E4] pt-4">
                    <ArticleForm
                      article={editingArticle}
                      onDone={() => setEditingId(null)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}