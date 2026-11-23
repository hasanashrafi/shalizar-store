import mongoose, { type HydratedDocument, type Model } from "mongoose";

const { Schema } = mongoose;

export interface IPriceTier {
  minKg: number;
  maxKg?: number | null;
  pricePerKg: number;
}

export interface IProduct {
  title: string;
  slug: string;
  origin: string;
  caliber: string;
  wastePercent?: number | null;
  moisturePercent?: number | null;
  packaging: string;
  packageWeightKg: number;
  moqKg: number;
  stockKg: number;
  purchasePricePerKg?: number; // Cost price per kg for profit calculation
  views: number;
  imageUrl?: string;
  tiers: IPriceTier[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<IProduct>;
export type ProductModel = Model<IProduct>;

const priceTierSchema = new Schema<IPriceTier>(
  {
    minKg: { type: Number, required: true, min: 0 },
    maxKg: { type: Number, min: 0, default: null },
    pricePerKg: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    origin: { type: String, required: true, trim: true },
    caliber: { type: String, required: true, trim: true },
    wastePercent: { type: Number, min: 0, max: 100, default: null },
    moisturePercent: { type: Number, min: 0, max: 100, default: null },
    packaging: { type: String, required: true, trim: true },
    packageWeightKg: { type: Number, required: true, min: 1 },
    moqKg: { type: Number, required: true, min: 1 },
    stockKg: { type: Number, required: true, min: 0, default: 0 },
    purchasePricePerKg: { type: Number, min: 0 }, // Cost price for profit analysis
    views: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, trim: true },
    tiers: {
      type: [priceTierSchema],
      default: [],
      validate: {
        validator: (tiers: IPriceTier[]) => tiers.length > 0,
        message: "Add at least one price tier.",
      },
    },
  },
  { timestamps: true },
);

productSchema.index({ updatedAt: -1 });

const Product =
  (mongoose.models.Product as ProductModel | undefined) ??
  mongoose.model<IProduct>("Product", productSchema);

export default Product;
