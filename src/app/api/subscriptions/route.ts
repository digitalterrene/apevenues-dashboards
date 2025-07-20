// app/api/subscriptions/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { cookies } from "next/headers";
import { KeyBundle } from "@/models/KeyBundle";
import { Subscription } from "@/models/Subscription";
import { verifyToken } from "@/lib/verifyToken";

// Generate unique key
const generateKey = (bundleId: ObjectId, index: number): string => {
  const payload = `${bundleId.toString()}-${index}-${Date.now()}`;
  const hash = crypto.createHash("sha256");
  hash.update(payload + process.env.KEY_SECRET);
  return hash.digest("hex").slice(0, 20);
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const { bundleId, paystackSubscriptionId } = await request.json();

    if (!bundleId || !paystackSubscriptionId) {
      return NextResponse.json(
        { error: "Bundle ID and Paystack ID are required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 1. Verify bundle exists
    const bundle = await db.collection<KeyBundle>("keyBundles").findOne({
      _id: new ObjectId(bundleId),
    });

    if (!bundle) {
      return NextResponse.json(
        { error: "Key bundle not found" },
        { status: 404 }
      );
    }

    // 2. Generate keys
    const keys = Array.from({ length: bundle.keyCount }, (_, i) => ({
      key: generateKey(bundle._id!, i),
      used: false,
    }));

    // 3. Create subscription
    const newSubscription: Subscription = {
      userId: decoded.userId,
      bundleId: bundle._id!,
      paystackSubscriptionId,
      keys,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("subscriptions")
      .insertOne(newSubscription);

    return NextResponse.json(
      {
        success: true,
        subscription: {
          ...newSubscription,
          id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const { searchParams } = new URL(request.url);
    const userId = decoded.userId;

    const db = await getDb();
    const subscriptions = await db
      .collection("subscriptions")
      .find({ userId })
      .toArray();

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map((sub) => ({
        ...sub,
        id: sub._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
