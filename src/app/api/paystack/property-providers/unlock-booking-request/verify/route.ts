// app/api/paystack/property-providers/unlock-booking-request/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paystackReference = searchParams.get("reference");
    const cookieInitToken = request.cookies.get("payment_init_token")?.value;

    console.log("Verification started with:", {
      paystackReference,
      cookieInitToken,
    });

    if (!paystackReference) {
      console.error("Missing Paystack reference");
      return NextResponse.json(
        { success: false, error: "no_reference" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if payment was already processed
    const existingPayment = await db.collection("bookingPayments").findOne({
      paystackReference,
    });

    if (existingPayment) {
      console.log("Payment already processed");
      return NextResponse.json({ success: true, status: "already_processed" });
    }

    // Verify payment with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${paystackReference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        timeout: 10000,
      }
    );

    const paymentData = paystackResponse.data.data;

    if (paymentData.status !== "success") {
      console.error("Payment not successful:", paymentData.status);
      return NextResponse.json(
        { success: false, error: "payment_failed" },
        { status: 400 }
      );
    }

    // Find init token by either cookie or reference
    const initToken = await db.collection("paymentInitTokens").findOne({
      $or: [
        { token: cookieInitToken },
        { token: paystackReference }, // Fallback if cookie is missing
      ],
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (!initToken) {
      console.error("Invalid or expired init token");
      return NextResponse.json(
        { success: false, error: "invalid_token" },
        { status: 400 }
      );
    }

    // Record payment
    const paymentRecord = {
      userId: initToken.userId,
      bookingId: initToken.bookingId,
      paystackReference,
      initToken: initToken.token,
      amount: paymentData.amount / 100,
      paymentDate: new Date(paymentData.paid_at),
      status: "completed",
      createdAt: new Date(),
    };

    await db.collection("bookingPayments").insertOne(paymentRecord);
    await db
      .collection("bookings")
      .updateOne(
        { _id: new ObjectId(initToken.bookingId) },
        { $set: { isPaid: true, unlockedAt: new Date() } }
      );
    await db
      .collection("paymentInitTokens")
      .updateOne(
        { _id: new ObjectId(initToken._id) },
        { $set: { status: "completed" } }
      );

    // Successful response
    const response = NextResponse.json({
      success: true,
      status: "payment_verified",
    });

    // Clear the cookie if it exists
    if (cookieInitToken) {
      response.cookies.delete("payment_init_token");
    }

    return response;
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "server_error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
