// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const db = await getDb();

    const [totalBundles, popularBundle, recentSubscriptions] =
      await Promise.all([
        db.collection("keyBundles").countDocuments(),
        db
          .collection("keyBundles")
          .find()
          .sort({ price: -1 })
          .limit(1)
          .toArray(),
        db
          .collection("subscriptions")
          .find({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          })
          .count(),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalBundles,
        popularBundle: popularBundle[0]?.name || "N/A",
        recentSubscriptions,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
