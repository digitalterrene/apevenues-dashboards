//api/paystack/service-providers-plans/route.ts
import { Plan } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const plans: Plan[] = [
      {
        type: "service-providers-plans",
        price: 5000,
        keys_count: 30,
        url: "https://paystack.shop/pay/key-bundle-plan-one",
        name: "Key Bundle One",
        description: "The cheapest plan",
        id: "1",
      },
      {
        type: "service-providers-plans",
        price: 15000,
        keys_count: 50,
        url: "https://paystack.shop/pay/key-bundle-plan-two",
        name: "Key Bundle Two",
        description: "The slightly cheaper one",
        id: "2",
      },
      {
        type: "service-providers-plans",
        price: 30000,
        keys_count: 1200,
        url: "https://paystack.shop/pay/key-bundle-plan-three",
        name: "Key Bundle Three",
        description: "The expensive plan",
        id: "3",
      },
    ];

    const response = NextResponse.json({
      success: true,
      plans: plans,
    });

    // Cache for 1 hour (3600 seconds)
    // response.headers.set("Cache-Control", "public, s-maxage=3600");
    return response;
  } catch (error: unknown) {
    console.error("Get plans error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
