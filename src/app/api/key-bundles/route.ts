// app/api/key-bundles/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { KeyBundle } from "@/models/KeyBundle";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/verifyToken";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    GET;
    const decoded = await verifyToken(token);
    const bundleData: Partial<KeyBundle> = await request.json();

    // Validation
    const requiredFields = ["name", "keyCount", "price"];
    const missingFields = requiredFields.filter((field) => !bundleData[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const db = await getDb();
    const newBundle: KeyBundle = {
      ...bundleData,
      currency: "ZAR",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as KeyBundle;

    const result = await db.collection("keyBundles").insertOne(newBundle);

    return NextResponse.json(
      {
        success: true,
        bundle: {
          ...newBundle,
          id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create bundle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const bundles = await db.collection("keyBundles").find({}).toArray();

    return NextResponse.json({
      success: true,
      bundles: bundles.map((bundle) => ({
        ...bundle,
        id: bundle._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Get bundles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
