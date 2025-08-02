// app/api/paystack/service-providers-plans/keys/bundles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export interface KeyBundle {
  _id?: ObjectId;
  userId: ObjectId;
  transactionId: string;
  bundleName: string;
  totalKeys: number;
  keysUsed: number;
  keysRemaining: number;
  purchaseDate: Date;
}

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

    const decoded = await verifyToken(token);
    const userId = new ObjectId(decoded.userId);

    // Get all active bundles for the user
    const bundles = await db
      .collection<KeyBundle>("keyBundles")
      .find({
        userId,
        keysRemaining: { $gt: 0 }, // Only bundles with keys left
      })
      .sort({ purchaseDate: 1 }) // Oldest bundles first
      .toArray();

    return NextResponse.json({ success: true, bundles });
  } catch (error) {
    console.error("Error fetching key bundles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// // app/api/paystack/service-providers-plans/keys/bundles/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getDb } from "@/lib/mongodb";
// import { ObjectId } from "mongodb";
// import jwt from "jsonwebtoken";
// import { cookies } from "next/headers";

// export interface KeyBundle {
//   _id?: ObjectId;
//   userId: ObjectId;
//   transactionId: string;
//   bundleName: string;
//   totalKeys: number;
//   keysUsed: number;
//   keysRemaining: number;
//   purchaseDate: Date;
// }

// const verifyToken = async (token: string): Promise<{ userId: string }> => {
//   if (!process.env.JWT_SECRET) {
//     throw new Error("JWT_SECRET not configured");
//   }

//   return new Promise((resolve, reject) => {
//     jwt.verify(token, `${process.env.JWT_SECRET}`, (err, decoded) => {
//       if (err) return reject(err);
//       if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
//         return reject(new Error("Invalid token payload"));
//       }
//       resolve(decoded as { userId: string });
//     });
//   });
// };

// export async function GET(request: NextRequest) {
//   try {
//     const db = await getDb();
//     const cookieStore = await cookies();
//     const authHeader = request.headers.get("Authorization");
//     const token =
//       authHeader?.split(" ")[1] || cookieStore.get("authToken")?.value;

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = await verifyToken(token);
//     const userId = new ObjectId(decoded.userId);

//     // Get all active bundles for the user
//     const bundles = await db
//       .collection<KeyBundle>("keyBundles")
//       .find({
//         userId,
//         keysRemaining: { $gt: 0 }, // Only bundles with keys left
//       })
//       .sort({ purchaseDate: 1 }) // Oldest bundles first
//       .toArray();

//     return NextResponse.json({ success: true, bundles });
//   } catch (error) {
//     console.error("Error fetching key bundles:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
