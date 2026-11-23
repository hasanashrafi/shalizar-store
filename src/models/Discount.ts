import mongoose, {
  type HydratedDocument,
  type Model,
} from "mongoose";

const { Schema } = mongoose;

export interface IDiscount {
  name: string;
  description?: string;
  type: "VOLUME" | "PERCENTAGE" | "FIXED_AMOUNT" | "TIERED";
  scope: "GLOBAL" | "PRODUCT" | "CATEGORY";
  productIds?: mongoose.Types.ObjectId[];
  category?: string;
  tiers: Array<{
    minQuantity: number;
    maxQuantity?: number | null;
    discountValue: number;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  }>;
  startDate: Date;
  endDate?: Date | null;
  isActive: boolean;
  usageLimit?: number | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type DiscountDocument = HydratedDocument<IDiscount>;
export type DiscountModel = Model<IDiscount>;

const discountSchema = new Schema<IDiscount>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ["VOLUME", "PERCENTAGE", "FIXED_AMOUNT", "TIERED"], required: true },
    scope: { type: String, enum: ["GLOBAL", "PRODUCT", "CATEGORY"], required: true, default: "GLOBAL" },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    category: { type: String, trim: true },
    tiers: [
      {
        minQuantity: { type: Number, required: true, min: 1 },
        maxQuantity: { type: Number, default: null },
        discountValue: { type: Number, required: true, min: 0 },
        discountType: { type: String, enum: ["PERCENTAGE", "FIXED_AMOUNT"], required: true },
      },
    ],
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true, index: true },
    usageLimit: { type: Number, default: null },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

discountSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
discountSchema.index({ scope: 1, productIds: 1 });

const Discount =
  (mongoose.models.Discount as DiscountModel | undefined) ??
  mongoose.model<IDiscount>("Discount", discountSchema);

export default Discount;