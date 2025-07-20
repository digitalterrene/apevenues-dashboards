// app/api/admin/key-bundles/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    // Verify admin
    const { error } = await verifyAdmin();
    if (error) return error;

    const { name, description, keyCount, price } = await request.json();

    // Validation
    if (!name || !keyCount || !price) {
      return NextResponse.json(
        { error: "Name, key count and price are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const newBundle = {
      name,
      description: description || "",
      keyCount: Number(keyCount),
      price: Number(price) * 100, // Convert to cents
      currency: "ZAR",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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
    // Verify admin
    const { error } = await verifyAdmin();
    if (error) return error;

    const db = await getDb();
    const bundles = await db
      .collection("keyBundles")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      bundles: bundles.map((bundle) => ({
        ...bundle,
        id: bundle._id.toString(),
        price: bundle.price / 100, // Convert back to Rand
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

export async function PUT(request: Request) {
  try {
    // Verify admin
    const { error } = await verifyAdmin();
    if (error) return error;

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Bundle ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const update = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Convert price back to cents if present
    if (updateData.price) {
      update.price = Number(updateData.price) * 100;
    }

    const result = await db
      .collection("keyBundles")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update bundle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Verify admin
    const { error } = await verifyAdmin();
    if (error) return error;

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Bundle ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection("keyBundles").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete bundle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
