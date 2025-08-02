//api/paystack/property-providers-plans/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const plans: any[] = [
      {
        type: "property-providers-plans",
        plan_amount: 15000,
        url: "https://paystack.shop/pay/subscription-individual-property-owner",
        name: "Individual Property Owner Plan",
        plan_code: "PLN_ctlrx6dciwronic",
        description:
          "This plan is for individual property owners. They can only list up to 3 properties",
        id: "PLN_ctlrx6dciwronic",
      },
      {
        type: "property-providers-plans",
        plan_amount: 29000,
        url: "https://paystack.shop/pay/subscription-independent-agent",
        name: "Independent Agent Plan",
        plan_code: "PLN_pvlfoes9u7qqfyq",
        description:
          "This plan is for independent agents. They can only list up to 10 properties",
        id: "PLN_pvlfoes9u7qqfyq",
      },
      {
        type: "property-providers-plans",
        plan_amount: 50000,
        url: "https://paystack.shop/pay/subscription-real-estate-agency",
        name: "Real Estate Agency Plan",
        plan_code: "PLN_kziuz2bsfvcm7xl",
        description:
          "This plan is for real estate agencies. They can only list up to 50 properties",
        id: "PLN_kziuz2bsfvcm7xl",
      },
      {
        type: "property-providers-plans",
        plan_amount: 175000,
        url: "https://paystack.shop/pay/subscription-property-management-group",
        name: "Property Management Group Plan",
        plan_code: "PLN_4v1de06ipcvrz31",
        description:
          "This plan is for companies that are property management groups. They can list up to 500 properties",
        id: "PLN_4v1de06ipcvrz31",
      },
    ];

    const response = NextResponse.json({
      success: true,
      plans: plans,
    });
    return response;
  } catch (error: unknown) {
    console.error("Get plans error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
