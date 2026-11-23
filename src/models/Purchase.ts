import mongoose, {
  type HydratedDocument,
  type Model,
} from "mongoose";

const { Schema } = mongoose;

export interface IPurchase {
  productId: mongoose.Types.ObjectId;
  productTitle: string;
  origin: string;
  caliber: string;
  packageWeightKg: number;
  bagsCount: number;
  totalWeightKg: number;
  unitCost: number;
  totalCost: number;
  supplierName: string;
  supplierPhone?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID";
  paidAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PurchaseDocument = HydratedDocument<IPurchase>;
export type PurchaseModel = Model<IPurchase>;

const purchaseSchema = new Schema<IPurchase>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    productTitle: { type: String, required: true, trim: true },
    origin: { type: String, required: true, trim: true },
    caliber: { type: String, required: true, trim: true },
    packageWeightKg: { type: Number, required: true, min: 0 },
    bagsCount: { type: Number, required: true, min: 0 },
    totalWeightKg: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    supplierName: { type: String, required: true, trim: true },
    supplierPhone: { type: String, trim: true },
    invoiceNumber: { type: String, trim: true },
    invoiceDate: { type: Date },
    paymentStatus: { type: String, enum: ["PENDING", "PARTIAL", "PAID"], default: "PENDING", index: true },
    paidAmount: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

purchaseSchema.index({ createdAt: -1 });
purchaseSchema.index({ supplierName: 1 });

const Purchase =
  (mongoose.models.Purchase as PurchaseModel | undefined) ??
  mongoose.model<IPurchase>("Purchase", purchaseSchema);

export default Purchase;