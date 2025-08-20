// app/api/paystack/property-providers/unlock-booking-request/init/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const db = await getDb();

    // Verify booking exists and belongs to user
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(bookingId),
      user_id: decoded.userId,
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    // Create payment init token (expires in 30 minutes)
    const paymentInitToken = new ObjectId().toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await db.collection("paymentInitTokens").insertOne({
      token: paymentInitToken,
      bookingId: new ObjectId(bookingId),
      userId: new ObjectId(decoded.userId),
      expiresAt,
      createdAt: new Date(),
      status: "pending",
    });

    // Determine callback URL based on environment
    const isProduction = process.env.NODE_ENV === "production";
    const callbackUrl = isProduction
      ? "https://app.apevenues.com/api/paystack/property-providers/unlock-booking-request/verify"
      : "https://19d0bd3b4d6b.ngrok-free.app/api/paystack/property-providers/unlock-booking-request/verify";

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      paymentUrl: `https://paystack.shop/pay/booking-request-fee?reference=${paymentInitToken}&callback_url=${encodeURIComponent(
        callbackUrl
      )}`,
    });

    // Set secure HTTP-only cookie with the init token
    response.cookies.set({
      name: "payment_init_token",
      value: paymentInitToken,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60, // 30 minutes
    });

    return response;
  } catch (error) {
    console.error("Payment init error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
