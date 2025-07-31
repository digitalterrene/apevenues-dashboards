// app/api/paystack/service-providers-plans/customer-plans/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDb } from "@/lib/mongodb";
import axios from "axios";
import { ObjectId } from "mongodb";

// Constants
const PAYSTACK_TIMEOUT = 15000; // Increased timeout slightly to be safe
const MAX_RETRIES = 2;
const TRANSACTIONS_PER_PAGE = 20;

// Interfaces
interface PaystackCustomer {
  id: number; // This is the integer ID required by the transaction endpoint
  email: string;
  customer_code: string;
}

interface PaystackTransaction {
  reference: any;
  id: string;
  amount: number;
  status: string;
  plan?: {
    id: string;
    name: string;
  };
  paid_at: string;
}

interface ActivePlan {
  planId: string;
  planName: string;
  amount: number;
  purchaseDate: string;
  status: string;
}

interface PaystackResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    pageCount: number;
  };
}

// Utility Functions
const verifyToken = async (token: string): Promise<{ userId: string }> => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  return new Promise((resolve, reject) => {
    jwt.verify(token, `${process.env.JWT_SECRET}`, (err, decoded) => {
      if (err) return reject(err);
      if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
        return reject(new Error("Invalid token payload"));
      }
      resolve(decoded as { userId: string });
    });
  });
};

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
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return fetchWithRetry<T>(url, config, retries - 1);
  }
};

// Main API Handler
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get("Authorization");
    const token =
      authHeader?.split(" ")[1] || cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const customerResponse = await fetchWithRetry<PaystackCustomer[]>(
      "https://api.paystack.co/customer",
      { params: { email: user.email } }
    );

    if (!customerResponse.data?.length) {
      return NextResponse.json(
        { activePlans: [], success: true },
        { status: 200 }
      );
    }

    const paystackCustomer = customerResponse.data[0];

    // *** THE FIX IS HERE ***
    // Use the integer `id` as required by the documentation.
    const transactionsResponse = await fetchWithRetry<PaystackTransaction[]>(
      `https://api.paystack.co/transaction`,
      {
        params: {
          customer: paystackCustomer.id, // Use the integer ID, not the string customer_code
          perPage: TRANSACTIONS_PER_PAGE,
          page: 1,
          status: "success", // Filter for success upfront
        },
      }
    );

    const planAmounts: Record<string, number> = {
      "Key Bundle One": 5000,
      "Key Bundle Two": 10000,
      "Key Bundle Three": 30000,
    };
    console.log({ transactionsResponse: transactionsResponse.data });
    const activePlans: ActivePlan[] = transactionsResponse.data
      .map((transaction) => {
        // First try to match by exact amount
        let planName = Object.entries(planAmounts).find(
          ([, amount]) => amount === transaction.amount
        )?.[0];

        // If no exact match, find the closest plan amount
        if (!planName) {
          planName = Object.entries(planAmounts).reduce(
            (closest, [name, amount]) => {
              const currentDiff = Math.abs(transaction.amount - amount);
              const closestDiff = Math.abs(transaction.amount - closest.amount);
              return currentDiff < closestDiff ? { name, amount } : closest;
            },
            { name: "", amount: Infinity }
          ).name;
        }

        if (!planName) {
          console.warn(`No plan found for amount: ${transaction.amount}`);
          return null;
        }

        return {
          planId: transaction.reference, // Using reference as it's more reliable
          planName,
          amount: transaction.amount / 100, // Convert cents to Rand
          purchaseDate: transaction.paid_at,
          status: transaction.status,
        };
      })
      .filter(Boolean) as ActivePlan[];

    return NextResponse.json({
      success: true,
      activePlans,
      pagination: {
        total: transactionsResponse.meta?.total || 0,
        page: 1,
        hasMore:
          (transactionsResponse.meta?.total || 0) > TRANSACTIONS_PER_PAGE,
      },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Paystack API Error Details:", error.response?.data);
      const status = error.response?.status || 500;
      const message =
        error.response?.data?.message ||
        (status === 504 || error.code === "ECONNABORTED"
          ? "Payment service timeout. Please try again."
          : "An error occurred with the payment service.");

      return NextResponse.json({ error: message }, { status });
    }

    console.error("Generic Error in Get customer plans:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
