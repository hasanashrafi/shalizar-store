import mongoose, {
  type HydratedDocument,
  type Model,
} from "mongoose";

const { Schema } = mongoose;

export const PAYMENT_METHODS = [
  "ONLINE",
  "BANK_TRANSFER",
  "CHEQUE",
  "CASH_ON_DELIVERY",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "CLEARED",
  "REJECTED",
  "BOUNCED",
  "CANCELLED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface IPayment {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  userPhone: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  // Cheque-specific fields
  chequeNumber?: string;
  chequeSerial?: string;
  bankName?: string;
  branchName?: string;
  accountHolder?: string;
  accountNumber?: string;
  issueDate?: Date;
  dueDate?: Date;
  // Bank transfer / card-to-card fields
  cardNumber?: string;
  depositorName?: string;
  depositDate?: Date;
  trackingRef?: string;
  receiptImage?: string;
  // Online-specific fields
  gatewayRef?: string;
  transactionDate?: Date;
  // Common
  rejectReason?: string;
  confirmedBy?: string;
  confirmedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentDocument = HydratedDocument<IPayment>;
export type PaymentModel = Model<IPayment>;

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderNumber: { type: String, required: true, trim: true },
    userPhone: { type: String, required: true, trim: true, index: true },
    customerName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "PENDING",
      index: true,
    },
    chequeNumber: { type: String, trim: true },
    chequeSerial: { type: String, trim: true },
    bankName: { type: String, trim: true },
    branchName: { type: String, trim: true },
    accountHolder: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    issueDate: { type: Date },
    dueDate: { type: Date },
    cardNumber: { type: String, trim: true },
    depositorName: { type: String, trim: true },
    depositDate: { type: Date },
    trackingRef: { type: String, trim: true },
    receiptImage: { type: String },
    gatewayRef: { type: String, trim: true },
    transactionDate: { type: Date },
    rejectReason: { type: String, trim: true },
    confirmedBy: { type: String, trim: true },
    confirmedAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

const Payment =
  (mongoose.models.Payment as PaymentModel | undefined) ??
  mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;