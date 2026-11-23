import mongoose, {
  type HydratedDocument,
  type Model,
} from "mongoose";

const { Schema } = mongoose;

export interface IArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  author?: string | null;
  category?: string | null;
  isPublished: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ArticleDocument = HydratedDocument<IArticle>;
export type ArticleModel = Model<IArticle>;

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, trim: true, default: null },
    author: { type: String, trim: true, default: null },
    category: { type: String, trim: true, default: null },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

articleSchema.index({ slug: 1 }, { unique: true });
articleSchema.index({ isPublished: 1, createdAt: -1 });

const Article =
  (mongoose.models.Article as ArticleModel | undefined) ??
  mongoose.model<IArticle>("Article", articleSchema);

export default Article;
