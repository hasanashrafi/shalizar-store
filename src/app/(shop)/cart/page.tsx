import CheckoutPage, {
  type SavedCheckoutData,
} from "@/components/checkout/CheckoutPage";
import { connectToDatabase } from "@/lib/mongodb";
import { getUserById, getUserSessionUserId } from "@/lib/user-auth";
import Order from "@/models/Order";
import type { IUser } from "@/models/User";
import type { IOrder } from "@/models/Order";

export const dynamic = "force-dynamic";

type ShippingType = "CARRIER" | "EXCLUSIVE_TRUCK" | "FACTORY_PICKUP";

function buildSavedData(
  user: IUser | null,
  order: IOrder | null,
): SavedCheckoutData {
  const orderParts = (order?.destinationCity ?? "").split(" - ");
  const orderProvince = orderParts[0]?.trim() ?? "";
  const orderCity = orderParts.slice(1).join(" - ").trim();

  const customerName = user?.name || order?.customerName || "";
  const userPhone = user?.phone || order?.userPhone || "";
  const companyName = user?.companyName || order?.companyName || "";
  const nationalId = user?.nationalId || order?.nationalId || "";
  const economicId = user?.economicId || order?.economicId || "";
  const province = user?.province || orderProvince || "";
  const destinationCity = user?.destinationCity || orderCity || "";
  const address = user?.address || order?.deliveryAddress || "";
  const shippingType = (user?.preferredShippingType ||
    order?.shippingType ||
    "CARRIER") as ShippingType;
  const carrierName =
    user?.carrierName ||
    (order?.shippingType === "CARRIER" ? order?.warehouseName : "") ||
    "";

  const hasSavedData = Boolean(
    user?.profileCompleted ||
      address ||
      companyName ||
      nationalId ||
      economicId,
  );

  return {
    customerName,
    userPhone,
    companyName,
    nationalId,
    economicId,
    province,
    destinationCity,
    address,
    shippingType,
    carrierName,
    hasSavedData,
  };
}

export default async function CartPage() {
  await connectToDatabase();

  const userId = await getUserSessionUserId();
  const user = userId ? await getUserById(userId) : null;

  let lastOrder: IOrder | null = null;
  if (user?.phone) {
    const doc = await Order.findOne({ userPhone: user.phone })
      .sort({ createdAt: -1 })
      .lean();
    lastOrder = doc ? (doc as unknown as IOrder) : null;
  }

  const savedData = buildSavedData(user, lastOrder);

  return <CheckoutPage savedData={savedData} />;
}