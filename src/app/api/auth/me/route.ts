import { NextResponse } from "next/server";
import { getUserSessionUserId } from "@/lib/user-auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getUserSessionUserId();
    if (!userId) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    await connectToDatabase();
    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email ?? null,
        companyName: user.companyName ?? null,
        nationalId: user.nationalId ?? null,
        economicId: user.economicId ?? null,
        province: user.province ?? null,
        destinationCity: user.destinationCity ?? null,
        address: user.address ?? null,
        carrierName: user.carrierName ?? null,
        preferredShippingType: user.preferredShippingType ?? null,
        profileCompleted: user.profileCompleted ?? false,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 },
    );
  }
}
