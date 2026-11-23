import { notFound, redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getUserSessionUserId, getUserById } from "@/lib/user-auth";
import Order from "@/models/Order";
import OrderPrintView from "./OrderPrintView";

export const dynamic = "force-dynamic";

interface OrderPrintPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getOrderById(id: string) {
  if (!isValidObjectId(id)) return null;

  await connectToDatabase();
  const order = await Order.findById(id).lean();

  if (!order) return null;

  return {
    ...order,
    id: order._id.toString(),
    items: order.items.map((item) => ({
      ...item,
      productId: item.productId.toString(),
    })),
  };
}

export default async function OrderPrintPage({
  params,
}: OrderPrintPageProps) {
  const resolvedParams = await params;

  const userId = await getUserSessionUserId();
  if (!userId) redirect("/auth/login");

  await connectToDatabase();
  const user = await getUserById(userId);
  if (!user || !user.isActive) {
    redirect("/auth/login");
  }

  const order = await getOrderById(resolvedParams.id);
  if (!order) {
    notFound();
  }

  if (order.userPhone !== user.phone) {
    notFound();
  }

  return <OrderPrintView order={order} />;
}