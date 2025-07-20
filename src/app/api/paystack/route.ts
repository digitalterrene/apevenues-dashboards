// app/api/paystack/webhook/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY!;

    // Verify signature
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const db = await getDb();

    switch (event.event) {
      case "subscription.create":
      case "subscription.enable":
        // Update subscription status to active
        await db
          .collection("subscriptions")
          .updateOne(
            { paystackSubscriptionId: event.data.subscription_code },
            { $set: { status: "active", updatedAt: new Date() } }
          );
        break;

      case "subscription.disable":
        // Update subscription status to cancelled
        await db
          .collection("subscriptions")
          .updateOne(
            { paystackSubscriptionId: event.data.subscription_code },
            { $set: { status: "cancelled", updatedAt: new Date() } }
          );
        break;

      case "invoice.payment_failed":
        // Handle payment failure
        await db.collection("subscriptions").updateOne(
          {
            paystackSubscriptionId: event.data.subscription.subscription_code,
          },
          { $set: { status: "expired", updatedAt: new Date() } }
        );
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
