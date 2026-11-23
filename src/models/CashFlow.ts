import mongoose, {
  type HydratedDocument,
  type Model,
} from "mongoose";

const { Schema } = mongoose;

export type CashFlowType =
  | "SALE"
  | "PURCHASE"
  | "EXPENSE"
  | "RECEIPT"
  | "PAYMENT"
  | "ADJUSTMENT";

export interface ICashFlow {
  type: CashFlowType;
  amount: number;
  description: string;
  referenceId?: mongoose.Types.ObjectId;
  referenceModel?: "Order" | "Purchase" | "Expense";
  category?: string;
  paymentMethod?: "CASH" | "BANK_TRANSFER" | "CHECK" | "CARD" | "OTHER";
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  date: Date;
  createdBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CashFlowDocument = HydratedDocument<ICashFlow>;
export type CashFlowModel = Model<ICashFlow>;

const cashFlowSchema = new Schema<ICashFlow>(
  {
    type: { type: String, enum: ["SALE", "PURCHASE", "EXPENSE", "RECEIPT", "PAYMENT", "ADJUSTMENT"], required: true, index: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    referenceId: { type: Schema.Types.ObjectId, index: true },
    referenceModel: { type: String, enum: ["Order", "Purchase", "Expense"] },
    category: { type: String, trim: true, index: true },
    paymentMethod: { type: String, enum: ["CASH", "BANK_TRANSFER", "CHECK", "CARD", "OTHER"] },
    status: { type: String, enum: ["PENDING", "COMPLETED", "CANCELLED"], default: "COMPLETED", index: true },
    date: { type: Date, required: true, index: true },
    createdBy: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

cashFlowSchema.index({ date: -1 });
cashFlowSchema.index({ type: 1, date: -1 });

const CashFlow =
  (mongoose.models.CashFlow as CashFlowModel | undefined) ??
  mongoose.model<ICashFlow>("CashFlow", cashFlowSchema);

export default CashFlow;