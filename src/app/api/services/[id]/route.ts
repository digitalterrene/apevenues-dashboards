import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Service, ServiceInput } from "@/types/service";

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication (optional)
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    // Database operations
    const db = await getDb();
    const collection = db.collection<Service>("services");

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid service ID" },
        { status: 400 }
      );
    }

    const service = await collection.findOne({
      _id: new ObjectId(params.id),
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Authorization check if token exists
    if (token) {
      try {
        const decoded = await verifyToken(token);
        if (service.user_id !== decoded.userId) {
          return NextResponse.json(
            { error: "Unauthorized to view this service" },
            { status: 403 }
          );
        }
      } catch (authError) {
        console.warn("Authentication error:", authError);
      }
    }

    const { _id, ...serviceData } = service;
    return NextResponse.json({
      success: true,
      service: {
        ...serviceData,
        id: _id.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Get service error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (error instanceof Error && error.name === "MongoNetworkError") {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 503 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const updates: Partial<ServiceInput> = await request.json();

    // Database operations
    const db = await getDb();
    const collection = db.collection<Service>("services");

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid service ID" },
        { status: 400 }
      );
    }

    // Check if service exists and belongs to user
    const existingService = await collection.findOne({
      _id: new ObjectId(params.id),
      user_id: decoded.userId,
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check for duplicate service (same name and category) excluding current service
    if (updates.name || updates.category) {
      const duplicateQuery: any = {
        user_id: decoded.userId,
        _id: { $ne: new ObjectId(params.id) }, // Exclude current service
      };

      if (updates.name) duplicateQuery.name = updates.name;
      if (updates.category) duplicateQuery.category = updates.category;
      else duplicateQuery.category = existingService.category;

      const duplicateService = await collection.findOne(duplicateQuery);

      if (duplicateService) {
        return NextResponse.json(
          {
            error: `Service '${
              updates.name || existingService.name
            }' already exists in category '${
              updates.category || existingService.category
            }'`,
          },
          { status: 409 } // 409 Conflict status code
        );
      }
    }

    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const updatedService = await collection.findOne({
      _id: new ObjectId(params.id),
    });

    if (!updatedService) {
      return NextResponse.json(
        { error: "Failed to fetch updated service" },
        { status: 500 }
      );
    }

    const { _id, ...serviceData } = updatedService;
    return NextResponse.json({
      success: true,
      service: {
        ...serviceData,
        id: _id.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Update service error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (error instanceof Error && error.name === "MongoNetworkError") {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 503 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    // Database operations
    const db = await getDb();
    const collection = db.collection<Service>("services");

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid service ID" },
        { status: 400 }
      );
    }

    // Check if service exists and belongs to user
    const existingService = await collection.findOne({
      _id: new ObjectId(params.id),
      user_id: decoded.userId,
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found or unauthorized" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await db.collection("services").deleteOne({
      _id: new ObjectId(params.id),
    });

    return NextResponse.json(
      { success: true, message: "Service deactivated successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Delete service error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (error instanceof Error && error.name === "MongoNetworkError") {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 503 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
