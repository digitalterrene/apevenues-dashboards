//api/properties/route.ts
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Property, PropertyInput } from "@/types/property";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const propertyData: PropertyInput = await request.json();

    // Basic validation
    if (!propertyData.name || !propertyData.type || !propertyData.address) {
      return NextResponse.json(
        { error: "Name, type, and address are required" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    const newProperty: any = {
      ...propertyData,
      businessId: decoded.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<Property>("properties")
      .insertOne(newProperty);
    await client.close();

    return NextResponse.json(
      {
        success: true,
        property: {
          ...newProperty,
          id: result.insertedId.toString(),
          _id: undefined,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create property error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    let query = {};
    if (userId) {
      query = { businessId: userId };
    }

    const properties = await db
      .collection<Property>("properties")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    const sanitizedProperties = properties.map((prop) => ({
      ...prop,
      id: prop._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({
      success: true,
      properties: sanitizedProperties,
    });
  } catch (error) {
    console.error("Get properties error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
