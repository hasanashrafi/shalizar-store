import mongoose, {
  type HydratedDocument,
  type Model,
} from "mongoose";

const { Schema } = mongoose;

export type ExpenseCategory =
  | "TRANSPORT"
  | "WAREHOUSE"
  | "SALARY"
  | "UTILITIES"
  | "MARKETING"
  | "MAINTENANCE"
  | "INSURANCE"
  | "TAX"
  | "OTHER";

export interface IExpense {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CHECK" | "CARD" | "OTHER";
  paymentStatus: "PENDING" | "PAID" | "PARTIAL";
  paidAmount: number;
  vendorName?: string;
  vendorPhone?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseDocument = HydratedDocument<IExpense>;
export type ExpenseModel = Model<IExpense>;

const expenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ["TRANSPORT", "WAREHOUSE", "SALARY", "UTILITIES", "MARKETING", "MAINTENANCE", "INSURANCE", "TAX", "OTHER"], required: true, index: true },
    paymentMethod: { type: String, enum: ["CASH", "BANK_TRANSFER", "CHECK", "CARD", "OTHER"], required: true },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "PARTIAL"], default: "PENDING", index: true },
    paidAmount: { type: Number, default: 0, min: 0 },
    vendorName: { type: String, trim: true },
    vendorPhone: { type: String, trim: true },
    invoiceNumber: { type: String, trim: true },
    invoiceDate: { type: Date },
    dueDate: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

expenseSchema.index({ createdAt: -1 });
expenseSchema.index({ category: 1, createdAt: -1 });

const Expense =
  (mongoose.models.Expense as ExpenseModel | undefined) ??
  mongoose.model<IExpense>("Expense", expenseSchema);

export default Expense;