// app/api/paystack/property-providers-plans/customer-plans/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDb } from "@/lib/mongodb";
import axios from "axios";
import { ObjectId } from "mongodb";

// --- Constants ---
const PAYSTACK_TIMEOUT = 15000; // Timeout for Paystack API calls
const MAX_RETRIES = 2; // Number of retries for failed API calls

// --- Interfaces ---
// Describes the structure of a customer object from Paystack
interface PaystackCustomer {
  id: number;
  email: string;
  customer_code: string;
}

// Describes the structure of a subscription object from Paystack
interface PaystackSubscription {
  id: number;
  subscription_code: string;
  amount: number;
  status: "active" | "non-renewing" | "cancelled" | "complete";
  next_payment_date: string;
  createdAt: string;
  plan: {
    id: number;
    name: string;
    plan_code: string;
    interval: string;
  };
}

// Describes the structure of the data we'll return to the client
interface ActiveSubscriptionDetails {
  subscriptionId: string;
  planName: string;
  planCode: string;
  amount: number;
  status: string;
  interval: string;
  nextRenewalDate: string;
  purchaseDate: string;
}

// Generic interface for a paginated Paystack API response
interface PaystackResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    pageCount: number;
  };
}

// --- Utility Functions ---

/**
 * Verifies the JWT token to authenticate the user.
 * @param token - The JWT token from the request.
 * @returns A promise that resolves with the decoded token payload.
 */
const verifyToken = async (token: string): Promise<{ userId: string }> => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured in environment variables.");
  }
  return new Promise((resolve, reject) => {
    jwt.verify(token, `${process.env.JWT_SECRET}`, (err, decoded) => {
      if (err) return reject(err);
      if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
        return reject(new Error("Invalid token payload structure."));
      }
      resolve(decoded as { userId: string });
    });
  });
};

/**
 * A wrapper around axios.get to handle retries with exponential backoff.
 * @param url - The URL to fetch.
 * @param config - Optional axios request configuration.
 * @param retries - The number of remaining retries.
 * @returns The data from the API response.
 */
const fetchWithRetry = async <T>(
  url: string,
  config?: any,
  retries = MAX_RETRIES
): Promise<PaystackResponse<T>> => {
  try {
    const response = await axios.get<PaystackResponse<T>>(url, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: PAYSTACK_TIMEOUT,
      ...config,
    });
    return response.data;
  } catch (error) {
    if (retries <= 0) throw error;
    // Wait for 1.5 seconds before retrying
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return fetchWithRetry<T>(url, config, retries - 1);
  }
};

// --- Main API Handler ---
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get("Authorization");
    const token =
      authHeader?.split(" ")[1] || cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Authenticate the user and find them in the database
    const decoded = await verifyToken(token);
    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Find the corresponding customer on Paystack using their email
    const customerResponse = await fetchWithRetry<PaystackCustomer[]>(
      "https://api.paystack.co/customer",
      { params: { email: user.email } }
    );

    // If the user is not a Paystack customer, they have no subscriptions
    if (!customerResponse.data?.length) {
      return NextResponse.json(
        { activeSubscriptions: [], success: true },
        { status: 200 }
      );
    }
    const paystackCustomer = customerResponse.data[0];

    // 3. Fetch all subscriptions for that customer from Paystack
    const subscriptionsResponse = await fetchWithRetry<PaystackSubscription[]>(
      `https://api.paystack.co/subscription`,
      {
        params: {
          customer: paystackCustomer.id, // Use the integer customer ID
          perPage: 100, // Fetch up to 100 subscriptions
        },
      }
    );

    // 4. Filter for active subscriptions and map to a clean format
    const activeSubscriptions: ActiveSubscriptionDetails[] =
      subscriptionsResponse.data
        .filter(
          (sub) => sub.status === "active" || sub.status === "non-renewing"
        )
        .map((sub) => ({
          subscriptionId: sub.subscription_code,
          planName: sub.plan.name,
          planCode: sub.plan.plan_code,
          amount: sub.amount / 100, // Convert from kobo to major currency unit
          status: sub.status,
          interval: sub.plan.interval,
          nextRenewalDate: sub.next_payment_date,
          purchaseDate: sub.createdAt,
        }));

    // 5. Sync active subscriptions with the local MongoDB database
    const subscriptionsCollection = db.collection(
      "propertyOwnersSubscriptions"
    );
    for (const sub of activeSubscriptions) {
      await subscriptionsCollection.updateOne(
        { subscriptionId: sub.subscriptionId }, // Filter: Find doc by unique subscription ID
        {
          $set: {
            // Fields to update every time
            userId: new ObjectId(decoded.userId),
            planName: sub.planName,
            planCode: sub.planCode,
            amount: sub.amount,
            status: sub.status,
            interval: sub.interval,
            nextRenewalDate: new Date(sub.nextRenewalDate),
            lastUpdated: new Date(),
          },
          $setOnInsert: {
            // Fields to set only when creating a new document
            subscriptionId: sub.subscriptionId,
            purchaseDate: new Date(sub.purchaseDate),
          },
        },
        { upsert: true } // Option to create a new doc if none is found
      );
    }

    return NextResponse.json({
      success: true,
      activeSubscriptions,
    });
  } catch (error: unknown) {
    // --- Comprehensive Error Handling ---
    if (axios.isAxiosError(error)) {
      console.error(
        "Paystack API Error in property-plans route:",
        error.response?.data
      );
      const status = error.response?.status || 500;
      const message =
        error.response?.data?.message ||
        "An error occurred with the payment service.";
      return NextResponse.json({ error: message }, { status });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.error("Generic Error in Get property customer plans:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
