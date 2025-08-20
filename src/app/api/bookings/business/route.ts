// app/api/bookings/business/route.ts
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
    };
    const userId = decoded.userId;

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    console.log({ userId });
    const bookings = await db
      .collection("bookings")
      .aggregate([
        { $match: { user_id: userId } },
        {
          $lookup: {
            from: "bookingPayments",
            localField: "_id",
            foreignField: "bookingId",
            as: "paymentInfo",
          },
        },
        {
          $addFields: {
            isPaid: { $anyElementTrue: "$paymentInfo" },
            unlockedAt: { $arrayElemAt: ["$paymentInfo.paymentDate", 0] },
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    await client.close();
    const restrictedInfo = {};
    return NextResponse.json({
      success: true,
      bookings: bookings.map(
        ({ customerName, customerEmail, customerPhone, ...booking }) => ({
          ...booking,
          customerName: booking.isPaid ? customerName : "locked",
          customerEmail: booking.isPaid ? customerEmail : "locked",
          customerPhone: booking.isPaid ? customerPhone : "locked",
          id: booking._id.toString(),
          _id: undefined,
          paymentInfo: undefined,
        })
      ),
    });
  } catch (error) {
    console.error("Get business bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
