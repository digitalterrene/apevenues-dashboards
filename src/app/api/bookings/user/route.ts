import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };
    const userEmail = decoded.email;

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    const bookings = await db
      .collection("bookings")
      .find({ customerEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    return NextResponse.json({
      success: true,
      bookings: bookings.map((booking) => ({
        ...booking,
        id: booking._id.toString(),
        _id: undefined,
      })),
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
