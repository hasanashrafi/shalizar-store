import mongoose, {
  type HydratedDocument,
  type Model,
} from "mongoose";

const { Schema } = mongoose;

export type ShippingType = "CARRIER" | "EXCLUSIVE_TRUCK" | "FACTORY_PICKUP";

export interface IUser {
  name: string;
  phone: string;
  passwordHash: string;
  email?: string | null;
  companyName?: string | null;
  nationalId?: string | null;
  economicId?: string | null;
  province?: string | null;
  destinationCity?: string | null;
  address?: string | null;
  carrierName?: string | null;
  preferredShippingType?: ShippingType | null;
  profileCompleted: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;
export type UserModel = Model<IUser>;

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true, default: null },
    companyName: { type: String, trim: true, default: null },
    nationalId: { type: String, trim: true, default: null },
    economicId: { type: String, trim: true, default: null },
    province: { type: String, trim: true, default: null },
    destinationCity: { type: String, trim: true, default: null },
    address: { type: String, trim: true, default: null },
    carrierName: { type: String, trim: true, default: null },
    preferredShippingType: {
      type: String,
      enum: ["CARRIER", "EXCLUSIVE_TRUCK", "FACTORY_PICKUP"],
      default: null,
    },
    profileCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ phone: 1 }, { unique: true });

const User =
  (mongoose.models.User as UserModel | undefined) ??
  mongoose.model<IUser>("User", userSchema);

export default User;