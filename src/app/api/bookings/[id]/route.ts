import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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
    const user_id = decoded.userId;

    const { status } = await request.json();
    if (!status || !["confirmed", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Verify booking belongs to business
    const existingBooking = await db.collection("bookings").findOne({
      _id: new ObjectId(params.id),
      user_id,
    });

    if (!existingBooking) {
      await client.close();
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    await db
      .collection("bookings")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $set: { status, updatedAt: new Date() } }
      );

    await client.close();

    return NextResponse.json({
      success: true,
      message: "Booking status updated",
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
