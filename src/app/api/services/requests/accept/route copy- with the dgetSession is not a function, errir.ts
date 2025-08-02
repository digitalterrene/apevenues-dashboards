// app/api/services/requests/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { startSession } from "mongoose";

export async function POST(request: NextRequest) {
  const { requestId, bundleId } = await request.json();

  if (!requestId || !bundleId) {
    return NextResponse.json(
      { error: "Request ID and Bundle ID are required" },
      { status: 400 }
    );
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
    const decoded = (await jwt.verify(token, process.env.JWT_SECRET!)) as {
      userId: string;
    };
    const userId = new ObjectId(decoded.userId);
    const requestObjectId = new ObjectId(requestId);
    const bundleObjectId = new ObjectId(bundleId);

    // Start transaction
    const session = await db.startSession();
    session.startTransaction();

    try {
      // 1. Get the service request to find its cost in keys
      const serviceRequest = await db
        .collection("serviceRequests")
        .findOne({ _id: requestObjectId }, { session });

      if (!serviceRequest) {
        throw new Error("Service request not found.");
      }

      // Check if user already accepted
      if (serviceRequest.acceptedBy.some((id: ObjectId) => id.equals(userId))) {
        throw new Error("You have already accepted this request.");
      }

      const keysToSpend = serviceRequest.priceInKeys || 1; // Default to 1 key

      // 2. Find the selected key bundle
      const keyBundle = await db.collection("keyBundles").findOne(
        {
          _id: bundleObjectId,
          userId,
        },
        { session }
      );

      if (!keyBundle) {
        throw new Error("Invalid key bundle selected.");
      }

      // 3. Check if there are enough keys
      if (keyBundle.keysRemaining < keysToSpend) {
        throw new Error(
          `Not enough keys in the selected bundle. Required: ${keysToSpend}, Available: ${keyBundle.keysRemaining}`
        );
      }

      // 4. Deduct keys from the bundle
      await db.collection("keyBundles").updateOne(
        { _id: bundleObjectId },
        {
          $inc: {
            keysRemaining: -keysToSpend,
            keysUsed: keysToSpend,
          },
        },
        { session }
      );

      // 5. Update the service request to mark it as accepted by the user
      await db
        .collection("serviceRequests")
        .updateOne(
          { _id: requestObjectId },
          { $addToSet: { acceptedBy: userId } },
          { session }
        );

      // 6. Log the transaction for auditing
      await db.collection("keyUsageLogs").insertOne(
        {
          userId,
          bundleId: bundleObjectId,
          serviceRequestId: requestObjectId,
          keysSpent: keysToSpend,
          usageDate: new Date(),
        },
        { session }
      );

      await session.commitTransaction();
      return NextResponse.json({
        success: true,
        message: "Request accepted successfully!",
        keysRemaining: keyBundle.keysRemaining - keysToSpend,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Error accepting request:", error);
    const message =
      error instanceof Error ? error.message : "Failed to accept request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
