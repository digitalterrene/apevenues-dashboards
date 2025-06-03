// app/api/auth/current/route.ts
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    await client.close();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Return user data without sensitive information
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Current user error:", error);
    return NextResponse.json({ user: null });
  }
}
