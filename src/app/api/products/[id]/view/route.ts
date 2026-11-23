import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const result = await Product.updateOne(
      { _id: id },
      { $inc: { views: 1 } },
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to register product view:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}