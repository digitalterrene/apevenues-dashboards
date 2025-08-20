// app/api/paystack/property-providers/unlock-booking-request/route.ts
import { BookingRequestFee } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const plan: BookingRequestFee = {
      type: "property-providers",
      url: "https://paystack.shop/pay/booking-request-fee",
      price: 25000,
      name: "Booking Request Fee",
      description: "One-time payment to unlock a booking request",
      id: "1",
    };

    const response = NextResponse.json({
      success: true,
      plan: plan, // Returning single plan object instead of array
    });

    // Cache for 1 hour (3600 seconds) if needed
    // response.headers.set("Cache-Control", "public, s-maxage=3600");
    return response;
  } catch (error: unknown) {
    console.error("Get booking request fee error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
