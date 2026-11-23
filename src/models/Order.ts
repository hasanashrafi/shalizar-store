import mongoose, {
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

const { Schema } = mongoose;

export const ORDER_STATUSES = [
  "PENDING",
  "APPROVED",
  "PAID",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type ShippingType = "CARRIER" | "EXCLUSIVE_TRUCK" | "FACTORY_PICKUP";
export type PaymentMethod =
  | "ONLINE"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "CASH_ON_DELIVERY";
export type OrderPaymentStatus =
  | "UNPAID"
  | "AWAITING_CLEARING"
  | "PAID"
  | "REJECTED";

export interface IOrderItem {
  productId: Types.ObjectId;
  productTitle: string;
  productSlug: string;
  caliber: string;
  origin: string;
  packaging: string;
  packageWeightKg: number;
  bagsCount: number;
  requestedKg: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder {
  customerName: string;
  userPhone: string;
  companyName?: string;
  nationalId?: string;
  economicId?: string;
  destinationCity: string;
  deliveryAddress: string;
  shippingType: ShippingType;
  warehouseName?: string;
  notes?: string;
  items: IOrderItem[];
  totalWeightKg: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod | null;
  paymentStatus: OrderPaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<IOrder>;
export type OrderModel = Model<IOrder>;

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productTitle: { type: String, required: true, trim: true },
    productSlug: { type: String, required: true, trim: true },
    caliber: { type: String, required: true, trim: true },
    origin: { type: String, required: true, trim: true },
    packaging: { type: String, required: true, trim: true },
    packageWeightKg: { type: Number, required: true, min: 1 },
    bagsCount: { type: Number, required: true, min: 1 },
    requestedKg: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    customerName: { type: String, required: true, trim: true },
    userPhone: { type: String, required: true, trim: true, index: true },
    companyName: { type: String, trim: true },
    nationalId: { type: String, trim: true },
    economicId: { type: String, trim: true },
    destinationCity: { type: String, required: true, trim: true },
    deliveryAddress: { type: String, required: true, trim: true },
    shippingType: {
      type: String,
      enum: ["CARRIER", "EXCLUSIVE_TRUCK", "FACTORY_PICKUP"],
      required: true,
    },
    warehouseName: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 1000 },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (items: IOrderItem[]) => items.length > 0,
        "Order must include at least one item.",
      ],
    },
    totalWeightKg: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "PENDING",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["ONLINE", "BANK_TRANSFER", "CHEQUE", "CASH_ON_DELIVERY"],
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "AWAITING_CLEARING", "PAID", "REJECTED"],
      default: "UNPAID",
      required: true,
    },
  },
  { timestamps: true },
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

const Order =
  (mongoose.models.Order as OrderModel | undefined) ??
  mongoose.model<IOrder>("Order", orderSchema);

export default Order;
