"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  createArticle,
  updateArticle,
  type ArticleActionState,
} from "@/app/admin/article-actions";
import PersianDatePicker from "@/components/ui/PersianDatePicker";

export interface EditableArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  author?: string | null;
  category?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
}

interface ArticleFormProps {
  article?: EditableArticle;
  onDone?: () => void;
}

const inputClass =
  "mt-1 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100";

const PRESET_COVERS = [
  "/images/blogs/blog-1.png",
  "/images/blogs/blog-2.png",
  "/images/blogs/blog-3.png",
  "/images/blogs/blog-4.png",
];

export default function ArticleForm({ article, onDone }: ArticleFormProps) {
  const isEdit = Boolean(article);
  const [state, formAction, isPending] = useActionState<ArticleActionState, FormData>(
    isEdit ? updateArticle : createArticle,
    {},
  );
  const [cover, setCover] = useState<string>(article?.coverImage ?? "");
  const [isPublished, setIsPublished] = useState<boolean>(
    article?.isPublished ?? true,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-[#E7E5E4] bg-[#FAF8F5] p-5"
    >
      {article && <input type="hidden" name="articleId" value={article.id} />}
      <input type="hidden" name="coverImage" value={cover} />
      <input type="hidden" name="isPublished" value={String(isPublished)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold sm:col-span-2">
          عنوان مقاله *
          <input
            name="title"
            required
            defaultValue={article?.title ?? ""}
            placeholder="مثال: راهنمای خرید عمده لوبیا"
            className={inputClass}
          />
        </label>

        <label className="text-sm font-semibold">
          نامک (slug)
          <input
            name="slug"
            defaultValue={article?.slug ?? ""}
            placeholder="خالی بگذارید تا خودکار ساخته شود"
            dir="ltr"
            className={`${inputClass} text-left`}
          />
        </label>

        <label className="text-sm font-semibold">
          نویسنده
          <input
            name="author"
            defaultValue={article?.author ?? "بازرگانی شالیزار"}
            className={inputClass}
          />
        </label>

        <label className="text-sm font-semibold sm:col-span-2">
          دسته‌بندی
          <input
            name="category"
            defaultValue={article?.category ?? ""}
            placeholder="مثال: راهنمای خرید"
            className={inputClass}
          />
        </label>

        <label className="text-sm font-semibold sm:col-span-2">
          خلاصه مقاله *
          <textarea
            name="excerpt"
            required
            rows={2}
            defaultValue={article?.excerpt ?? ""}
            placeholder="خلاصه کوتاه مقاله"
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
          />
        </label>

        <label className="text-sm font-semibold sm:col-span-2">
          متن مقاله * (هر پاراگراف را با یک خط خالی جدا کنید)
          <textarea
            name="content"
            required
            rows={8}
            defaultValue={article?.content ?? ""}
            placeholder="متن کامل مقاله..."
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm leading-7 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
          />
        </label>
      </div>

      {/* تصویر کاور */}
      <div className="space-y-2">
        <span className="text-sm font-semibold">تصویر کاور</span>
        <div className="flex flex-wrap gap-3">
          {PRESET_COVERS.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setCover(src)}
              className={`relative h-16 w-24 overflow-hidden rounded-lg border-2 transition ${
                cover === src
                  ? "border-amber-600 ring-2 ring-amber-200"
                  : "border-[#E7E5E4] hover:border-amber-300"
              }`}
            >
              <Image src={src} alt="تصویر کاور" fill className="object-cover" sizes="96px" />
            </button>
          ))}
          {cover && (
            <button
              type="button"
              onClick={() => setCover("")}
              className="flex h-16 w-24 items-center justify-center rounded-lg border-2 border-dashed border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-50"
            >
              حذف تصویر
            </button>
          )}
        </div>
        <input
          type="url"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="یا آدرس تصویر را وارد کنید (https://...)"
          dir="ltr"
          className={`${inputClass} text-left`}
        />
      </div>

      {/* وضعیت انتشار */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 accent-amber-600"
            />
            انتشار مقاله
          </label>
          {isPublished && (
            <div className="mt-2 max-w-xs">
              <span className="text-xs font-semibold text-stone-600">
                تاریخ انتشار (اختیاری)
              </span>
              <PersianDatePicker
                name="publishedAt"
                defaultValue={article?.publishedAt ?? undefined}
                className="mt-1"
                placeholder="تاریخ انتشار"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="min-h-11 rounded-xl bg-amber-600 px-5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-60"
          >
            {isPending ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "انتشار مقاله"}
          </button>
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="min-h-11 rounded-xl border border-stone-300 bg-white px-4 text-sm font-bold text-stone-600 hover:bg-stone-50"
            >
              انصراف
            </button>
          )}
        </div>
      </div>

      {state.error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          {state.success}
        </p>
      )}
    </form>
  );
}