//api/properties/[id]/route.ts
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { Property } from "@/types/property";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { PropertyUpdate } from "@/types/property";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    const property = await db.collection<Property>("properties").findOne({
      _id: new ObjectId(params.id),
    });

    await client.close();

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      property: {
        ...property,
        id: property._id.toString(),
        _id: undefined,
      },
    });
  } catch (error) {
    console.error("Get property error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const updateData: PropertyUpdate = await request.json();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Verify property belongs to user
    const existingProperty = await db.collection("properties").findOne({
      _id: new ObjectId(params.id),
      user_id: decoded.userId,
    });

    if (!existingProperty) {
      await client.close();
      return NextResponse.json(
        { error: "Property not found or unauthorized" },
        { status: 404 }
      );
    }

    const result = await db
      .collection("properties")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

    // Get updated property
    const updatedProperty = await db.collection("properties").findOne({
      _id: new ObjectId(params.id),
    });

    await client.close();

    return NextResponse.json({
      success: true,
      property: {
        ...updatedProperty,
        id: updatedProperty!._id.toString(),
        _id: undefined,
      },
    });
  } catch (error) {
    console.error("Update property error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Verify property belongs to user
    const existingProperty = await db.collection("properties").findOne({
      _id: new ObjectId(params.id),
      user_id: decoded.userId,
    });

    if (!existingProperty) {
      await client.close();
      return NextResponse.json(
        { error: "Property not found or unauthorized" },
        { status: 404 }
      );
    }

    await db.collection("properties").deleteOne({
      _id: new ObjectId(params.id),
    });

    await client.close();

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
