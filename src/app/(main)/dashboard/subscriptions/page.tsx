// app/subscriptions/page.tsx
import UserPlans from "@/components/dashboard/services/UserPlans";
import Subscriptions from "@/components/pages/Subscriptions";
import { Plan } from "@/types";
import { cookies } from "next/headers";

export default async function SubscriptionPage() {
  // Fetch available plans
  let plans: Plan[] = [];
  let userPlans: any = null;
  let plansError: string | null = null;
  let userPlansError: string | null = null;

  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  try {
    const plansResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/paystack/service-providers-plans`,
      { cache: "no-store" }
    );

    if (!plansResponse.ok)
      throw new Error(`HTTP error! status: ${plansResponse.status}`);

    const plansData = await plansResponse.json();
    if (plansData.success) {
      plans = plansData.plans;
    } else {
      throw new Error(plansData.error || "Failed to fetch plans");
    }
  } catch (err) {
    console.error("Failed to fetch plans:", err);
    plansError =
      err instanceof Error ? err.message : "Failed to load subscription plans";
  }

  // Fetch user's active plans
  try {
    const userPlansResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/paystack/service-providers-plans/customer-plans`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!userPlansResponse.ok)
      throw new Error(`HTTP error! status: ${userPlansResponse.status}`);

    const userPlansData = await userPlansResponse.json();
    if (userPlansData.success) {
      userPlans = userPlansData;
    } else {
      throw new Error(userPlansData.error || "Failed to fetch user plans");
    }
  } catch (err) {
    console.error("Failed to fetch user plans:", err);
    userPlansError =
      err instanceof Error ? err.message : "Failed to load your plans";
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <Subscriptions plans={plans} error={plansError} />
      <UserPlans
        data={userPlans}
        error={userPlansError}
        availablePlans={plans}
      />
    </div>
  );
}
