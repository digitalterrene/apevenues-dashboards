// app/api/auth/update/route.ts
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Define the user interface
interface User {
  _id: ObjectId;
  email: string;
  password: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

interface UpdateData {
  businessName?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  email?: string;
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const updateData: UpdateData = await request.json();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Update user with proper typing
    const result = await db
      .collection<User>("users")
      .updateOne(
        { _id: new ObjectId(decoded.userId) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      await client.close();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get updated user data with proper typing
    const updatedUser = await db.collection<User>("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    await client.close();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found after update" },
        { status: 404 }
      );
    }

    // Type-safe destructuring
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        id: userWithoutPassword._id.toString(),
        // Remove the MongoDB _id from the response
        _id: undefined,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
