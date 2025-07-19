// app/api/keys/use/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/verifyToken";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const { key, serviceId } = await request.json();

    if (!key || !serviceId) {
      return NextResponse.json(
        { error: "Key and service ID are required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 1. Find key in active subscriptions
    const subscription = await db.collection("subscriptions").findOne({
      userId: decoded.userId,
      status: "active",
      "keys.key": key,
      "keys.used": false,
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Valid key not found" },
        { status: 404 }
      );
    }

    // 2. Update key usage
    const keyIndex = subscription.keys.findIndex(
      (k: { key: any }) => k.key === key
    );
    const updateResult = await db.collection("subscriptions").updateOne(
      { _id: subscription._id, "keys.key": key },
      {
        $set: {
          [`keys.${keyIndex}.used`]: true,
          [`keys.${keyIndex}.usedAt`]: new Date(),
          [`keys.${keyIndex}.usedFor`]: serviceId,
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to use key" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Key used successfully",
    });
  } catch (error) {
    console.error("Use key error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
