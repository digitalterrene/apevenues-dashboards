//api/paystack/service-providers-plans/keys/bundles/route.ts
import { NextRequest, NextResponse } from "next/server"; 
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb";; 
import jwt from "jsonwebtoken"; 
import { cookies } from "next/headers";
export interface KeyBundle {
  _id?: ObjectId;
  userId: ObjectId;
  transactionId: string; // From Paystack
  bundleName: string; // e.g., "Key Bundle One"
  totalKeys: number;
  keysUsed: number;
  keysRemaining: number;
  purchaseDate: Date;
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
export async function GET(request: NextRequest) {
    try {
      const db = await getDb();
      const cookieStore = await cookies();
      const authHeader = request.headers.get("Authorization");
      const token =
        authHeader?.split(" ")[1] || cookieStore.get("authToken")?.value;

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // First we initialize the database with the user's keys bundles, if they were not initilized yet/
      //////////////////////////////////
      ///////////////////////////////
      //   we call this api: app/api/paystack/service-providers-plans/customer-plans/route.ts

      // whose code is like:
      // app/api/paystack/service-providers-plans/customer-plans/route.ts
    //   import { NextRequest, NextResponse } from "next/server";
    //   import { cookies } from "next/headers";
    //   import jwt from "jsonwebtoken";
    //   import { getDb } from "@/lib/mongodb";
    //   import axios from "axios";
    //   import { ObjectId } from "mongodb";

    //   // Constants
    //   const PAYSTACK_TIMEOUT = 15000; // Increased timeout slightly to be safe
    //   const MAX_RETRIES = 2;
    //   const TRANSACTIONS_PER_PAGE = 20;

    //   // Interfaces
    //   interface PaystackCustomer {
    //     id: number; // This is the integer ID required by the transaction endpoint
    //     email: string;
    //     customer_code: string;
    //   }

    //   interface PaystackTransaction {
    //     reference: any;
    //     id: string;
    //     amount: number;
    //     status: string;
    //     plan?: {
    //       id: string;
    //       name: string;
    //     };
    //     paid_at: string;
    //   }

    //   interface ActivePlan {
    //     planId: string;
    //     planName: string;
    //     amount: number;
    //     purchaseDate: string;
    //     status: string;
    //   }

    //   interface PaystackResponse<T> {
    //     data: T;
    //     meta?: {
    //       total: number;
    //       page: number;
    //       pageCount: number;
    //     };
    //   }

    //   // Utility Functions
    //   const verifyToken = async (
    //     token: string
    //   ): Promise<{ userId: string }> => {
    //     if (!process.env.JWT_SECRET) {
    //       throw new Error("JWT_SECRET not configured");
    //     }
    //     return new Promise((resolve, reject) => {
    //       jwt.verify(token, `${process.env.JWT_SECRET}`, (err, decoded) => {
    //         if (err) return reject(err);
    //         if (
    //           !decoded ||
    //           typeof decoded !== "object" ||
    //           !("userId" in decoded)
    //         ) {
    //           return reject(new Error("Invalid token payload"));
    //         }
    //         resolve(decoded as { userId: string });
    //       });
    //     });
    //   };

    //   const fetchWithRetry = async <T>(
    //     url: string,
    //     config?: any,
    //     retries = MAX_RETRIES
    //   ): Promise<PaystackResponse<T>> => {
    //     try {
    //       const response = await axios.get<PaystackResponse<T>>(url, {
    //         headers: {
    //           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    //           "Content-Type": "application/json",
    //         },
    //         timeout: PAYSTACK_TIMEOUT,
    //         ...config,
    //       });
    //       return response.data;
    //     } catch (error) {
    //       if (retries <= 0) throw error;
    //       await new Promise((resolve) => setTimeout(resolve, 1500));
    //       return fetchWithRetry<T>(url, config, retries - 1);
    //     }
    //   };

    //   // Main API Handler
    //   export async function GET(request: NextRequest) {
    //     try {
    //       const cookieStore = await cookies();
    //       const authHeader = request.headers.get("Authorization");
    //       const token =
    //         authHeader?.split(" ")[1] || cookieStore.get("authToken")?.value;

    //       if (!token) {
    //         return NextResponse.json(
    //           { error: "Unauthorized" },
    //           { status: 401 }
    //         );
    //       }

    //       const decoded = await verifyToken(token);
    //       const db = await getDb();
    //       const user = await db
    //         .collection("users")
    //         .findOne({ _id: new ObjectId(decoded.userId) });

    //       if (!user?.email) {
    //         return NextResponse.json(
    //           { error: "User not found" },
    //           { status: 404 }
    //         );
    //       }

    //       const customerResponse = await fetchWithRetry<PaystackCustomer[]>(
    //         "https://api.paystack.co/customer",
    //         { params: { email: user.email } }
    //       );

    //       if (!customerResponse.data?.length) {
    //         return NextResponse.json(
    //           { activePlans: [], success: true },
    //           { status: 200 }
    //         );
    //       }

    //       const paystackCustomer = customerResponse.data[0];

    //       // *** THE FIX IS HERE ***
    //       // Use the integer `id` as required by the documentation.
    //       const transactionsResponse = await fetchWithRetry<
    //         PaystackTransaction[]
    //       >(`https://api.paystack.co/transaction`, {
    //         params: {
    //           customer: paystackCustomer.id, // Use the integer ID, not the string customer_code
    //           perPage: TRANSACTIONS_PER_PAGE,
    //           page: 1,
    //           status: "success", // Filter for success upfront
    //         },
    //       });

    //       const planAmounts: Record<string, number> = {
    //         "Key Bundle One": 5000,
    //         "Key Bundle Two": 10000,
    //         "Key Bundle Three": 30000,
    //       };
    //       console.log({ transactionsResponse: transactionsResponse.data });
    //       const activePlans: ActivePlan[] = transactionsResponse.data
    //         .map((transaction) => {
    //           // First try to match by exact amount
    //           let planName = Object.entries(planAmounts).find(
    //             ([, amount]) => amount === transaction.amount
    //           )?.[0];

    //           // If no exact match, find the closest plan amount
    //           if (!planName) {
    //             planName = Object.entries(planAmounts).reduce(
    //               (closest, [name, amount]) => {
    //                 const currentDiff = Math.abs(transaction.amount - amount);
    //                 const closestDiff = Math.abs(
    //                   transaction.amount - closest.amount
    //                 );
    //                 return currentDiff < closestDiff
    //                   ? { name, amount }
    //                   : closest;
    //               },
    //               { name: "", amount: Infinity }
    //             ).name;
    //           }

    //           if (!planName) {
    //             console.warn(`No plan found for amount: ${transaction.amount}`);
    //             return null;
    //           }

    //           return {
    //             planId: transaction.reference, // Using reference as it's more reliable
    //             planName,
    //             amount: transaction.amount / 100, // Convert cents to Rand
    //             purchaseDate: transaction.paid_at,
    //             status: transaction.status,
    //           };
    //         })
    //         .filter(Boolean) as ActivePlan[];

    //       return NextResponse.json({
    //         success: true,
    //         activePlans,
    //         pagination: {
    //           total: transactionsResponse.meta?.total || 0,
    //           page: 1,
    //           hasMore:
    //             (transactionsResponse.meta?.total || 0) > TRANSACTIONS_PER_PAGE,
    //         },
    //       });
    //     } catch (error: unknown) {
    //       if (axios.isAxiosError(error)) {
    //         console.error("Paystack API Error Details:", error.response?.data);
    //         const status = error.response?.status || 500;
    //         const message =
    //           error.response?.data?.message ||
    //           (status === 504 || error.code === "ECONNABORTED"
    //             ? "Payment service timeout. Please try again."
    //             : "An error occurred with the payment service.");

    //         return NextResponse.json({ error: message }, { status });
    //       }

    //       console.error("Generic Error in Get customer plans:", error);

    //       if (error instanceof jwt.JsonWebTokenError) {
    //         return NextResponse.json(
    //           { error: "Invalid token" },
    //           { status: 401 }
    //         );
    //       }

    //       const errorMessage =
    //         error instanceof Error ? error.message : "Internal server error";
    //       return NextResponse.json({ error: errorMessage }, { status: 500 });
    //     }
    //   }

        
        
        
        
        // We then record in our database those plans
      //////////////////////////////////
      const decoded = await verifyToken(token);
      // Find the user by the email associated with the Paystack customer
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(decoded.userId) });

      if (!user) {
        console.error(`User not found for id: ${decoded.userId}`);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const newBundle: KeyBundle = {
        userId: user._id,
        transactionId: reference,
        bundleName: bundleDetails.name,
        totalKeys: bundleDetails.keys,
        keysUsed: 0,
        keysRemaining: bundleDetails.keys,
        purchaseDate: new Date(),
      };

      await db.collection<KeyBundle>("keyBundles").insertOne(newBundle);

      ///////////////////////////////////

      const bundles = await db
        .collection<KeyBundle>("keyBundles")
        .find({
          userId: user._id,
          keysRemaining: { $gt: 0 }, // Only fetch bundles that have keys left
        })
        .sort({ purchaseDate: 1 })
        .toArray(); // Oldest bundles first

      return NextResponse.json({ success: true, bundles });
    } catch (error) {
    console.error("Error fetching key bundles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}



The code to fetch the users' available keys would be:

export async function GET() {
  try {
      const db = await getDb();
      const cookieStore = await cookies();
      const authHeader = request.headers.get("Authorization");
      const token =
        authHeader?.split(" ")[1] || cookieStore.get("authToken")?.value;

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
 
      const decoded = await verifyToken(token);
    const bundles = await db.collection<KeyBundle>("keyBundles").find({
      userId: decoded.userId,
      keysRemaining: { $gt: 0 } // Only fetch bundles that have keys left
    }).sort({ purchaseDate: 1 }).toArray(); // Oldest bundles first

    return NextResponse.json({ success: true, bundles });

  } catch (error) {
    console.error("Error fetching key bundles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}




















//////////////////////////////////////////////////////////////////////////


// Now on the API to accept the    

export async function POST(request: Request, { params }: { params: { requestId: string } }) {
  const { requestId } = params;
  const { bundleId } = await request.json();

  if (!bundleId) {
    return NextResponse.json({ error: "Key bundle ID is required" }, { status: 400 });
  }

      const db = await getDb();
      const cookieStore = await cookies();
      const authHeader = request.headers.get("Authorization");
      const token =
        authHeader?.split(" ")[1] || cookieStore.get("authToken")?.value;

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }  

  try {
    let result;
   
      const serviceRequestsCollection = db.collection("serviceRequests");
      const keyBundlesCollection = db.collection("keyBundles");
      const keyUsageLogCollection = db.collection("keyUsageLogs");

      // 1. Get the service request to find its cost in keys
      const serviceRequest = await serviceRequestsCollection.findOne({ _id: new ObjectId(requestId) }, { session });
      if (!serviceRequest) {
        throw new Error("Service request not found.");
      }

      // Check if user already accepted
      if (serviceRequest.acceptedBy.some(id => id.equals(user._id))) {
          throw new Error("You have already accepted this request.");
      }

      const keysToSpend = serviceRequest.priceInKeys || 1; // Default to 1 key if not specified

      // 2. Find the selected key bundle
      const keyBundle = await keyBundlesCollection.findOne({ 
        _id: new ObjectId(bundleId),
        userId: user._id 
      }, { session });
      
      if (!keyBundle) {
        throw new Error("Invalid key bundle selected.");
      }

      // 3. Check if there are enough keys
      if (keyBundle.keysRemaining < keysToSpend) {
        throw new Error(`Not enough keys in the selected bundle. Required: ${keysToSpend}, Available: ${keyBundle.keysRemaining}`);
      }
      
      // 4. Deduct keys from the bundle
      await keyBundlesCollection.updateOne(
        { _id: keyBundle._id },
        { 
          $inc: { 
            keysRemaining: -keysToSpend,
            keysUsed: keysToSpend
          }
        },
        { session }
      );
      
      // 5. Update the service request to mark it as accepted by the user
      await serviceRequestsCollection.updateOne(
        { _id: serviceRequest._id },
        { $addToSet: { acceptedBy: user._id } },
        { session }
      );

      // 6. (Optional but recommended) Log the transaction for auditing
      await keyUsageLogCollection.insertOne({
          userId: user._id,
          bundleId: keyBundle._id,
          serviceRequestId: serviceRequest._id,
          keysSpent: keysToSpend,
          usageDate: new Date()
      }, { session });

      result = { success: true, message: "Request accepted successfully!" };
 
    
    return NextResponse.json(result);

  } catch (error) {
    console.error("Error accepting request:", error);
    const message = error instanceof Error ? error.message : "Failed to accept request";
    return NextResponse.json({ error: message }, { status: 400 }); // 400 for business logic errors
  } finally {
    await session.endSession();
  }
}