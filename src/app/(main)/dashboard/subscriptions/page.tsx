// app/subscriptions/page.tsx
import Subscriptions from "@/components/pages/subscriptions/Subscriptions";
import { Plan } from "@/types";
import { cookies } from "next/headers";

/**
 * A reusable function to fetch subscription plans and the customer's active plans
 * for a specific category (e.g., 'service-providers' or 'properties').
 * @param planType - The type of plan to fetch.
 * @param token - The user's authentication token.
 * @returns An object containing plans, userPlans, and any potential errors.
 */
async function fetchSubscriptionData(
  planType: "service-providers" | "property-providers",
  token: string | undefined
) {
  let plans: Plan[] = [];
  let userPlans: any = null;
  let plansError: string | null = null;
  let userPlansError: string | null = null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // --- Fetch all available plans for the given type ---
  try {
    const endpoint =
      planType === "property-providers"
        ? `${baseUrl}/api/paystack/${planType}/unlock-booking-request`
        : `${baseUrl}/api/paystack/${planType}-plans`;

    const plansResponse = await fetch(endpoint, {
      cache: "no-store",
    });

    if (!plansResponse.ok) {
      throw new Error(`HTTP error! status: ${plansResponse.status}`);
    }

    const plansData = await plansResponse.json();
    if (plansData.success) {
      // For property providers, we get a single plan object, convert it to array
      plans =
        planType === "property-providers" ? [plansData.plan] : plansData.plans;
    } else {
      throw new Error(plansData.error || `Failed to fetch ${planType} plans`);
    }
  } catch (err) {
    console.error(`Failed to fetch ${planType} plans:`, err);
    plansError =
      err instanceof Error
        ? err.message
        : `Failed to load ${planType} subscription plans`;
  }
  // --- Fetch the user's active plans for the given type ---
  // This requires an auth token.
  if (token) {
    try {
      const userPlansResponse = await fetch(
        `${baseUrl}/api/paystack/${planType}-plans/customer-plans`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!userPlansResponse.ok) {
        throw new Error(`HTTP error! status: ${userPlansResponse.status}`);
      }

      const userPlansData = await userPlansResponse.json();
      if (userPlansData.success) {
        userPlans = userPlansData;
      } else {
        throw new Error(
          userPlansData.error || `Failed to fetch user's ${planType} plans`
        );
      }
    } catch (err) {
      console.error(`Failed to fetch user's ${planType} plans:`, err);
      userPlansError =
        err instanceof Error
          ? err.message
          : `Failed to load your ${planType} plans`;
    }
  } else {
    userPlansError = "You must be logged in to see your active plans.";
  }

  return { plans, userPlans, plansError, userPlansError };
}

export default async function SubscriptionPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  // Use Promise.all to fetch data for both categories concurrently
  const [servicesData, propertiesData] = await Promise.all([
    fetchSubscriptionData("service-providers", token),
    fetchSubscriptionData("property-providers", token),
  ]);

  // Structure props for the "Services" category
  const servicesPageprops = {
    subscriptionsProps: {
      plans: servicesData.plans,
      error: servicesData.plansError,
    },
    userPlansProps: {
      userPlans: servicesData.userPlans,
      error: servicesData.userPlansError,
    },
  };

  // Structure props for the "Properties" category
  const propertiesPageProps = {
    subscriptionsProps: {
      plans: propertiesData?.plans,
      error: propertiesData?.plansError,
    },
    userPlansProps: {
      userPlans: propertiesData?.userPlans,
      error: propertiesData?.userPlansError,
    },
  };

  return (
    <Subscriptions
      servicesPageprops={servicesPageprops}
      propertiesPageProps={propertiesPageProps}
    />
  );
}
