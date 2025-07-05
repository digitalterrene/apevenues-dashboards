import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDb } from "@/lib/mongodb";
import { Service } from "@/types/service";

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

export async function POST(request: Request) {
  try {
    // Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const serviceData: any = await request.json();

    // Validation
    const requiredFields = [
      "name",
      "description",
      "price",
      "duration",
      "category",
    ];
    const missingFields = requiredFields.filter((field) => !serviceData[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Database operations
    const db = await getDb();
    const collection = db.collection("services");

    // Check for existing service with same name and category
    const existingService = await collection.findOne({
      name: serviceData.name,
      category: serviceData.category,
      user_id: decoded.userId, // Optional: restrict to same user if needed
    });

    if (existingService) {
      return NextResponse.json(
        {
          error: `Service '${serviceData.name}' already exists in category '${serviceData.category}'`,
        },
        { status: 409 } // 409 Conflict status code
      );
    }

    const newService: Service = {
      ...serviceData,
      user_id: decoded.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive:
        serviceData.isActive !== undefined ? serviceData.isActive : true,
    };

    const result = await collection.insertOne(newService);

    return NextResponse.json(
      {
        success: true,
        service: {
          ...newService,
          id: result.insertedId.toString(),
          _id: undefined,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create service error:", error);

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

export async function GET(request: Request) {
  try {
    // Authentication (optional)
    let userId: string | undefined;
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (token) {
      try {
        const decoded = await verifyToken(token);
        userId = decoded.userId;
      } catch (authError) {
        console.warn(
          "Authentication error (non-critical for public listings):",
          authError
        );
      }
    }

    // Query parameters
    const { searchParams } = new URL(request.url);
    const fetchMyServices = searchParams.get("userId");
    const searchTerm = searchParams.get("search");
    const typeFilter = searchParams.get("type");
    const cityFilter = searchParams.get("city");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );

    // Database operations
    const db = await getDb();
    const collection = db.collection<Service>("services");

    // Build query
    const query: any = {};

    // Add search filter if search term exists
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { address: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (fetchMyServices && userId) {
      query.user_id = userId;
    }
    if (typeFilter && typeFilter !== "all") {
      query.type = typeFilter;
    }
    if (cityFilter && cityFilter !== "all") {
      query.city = cityFilter;
    }

    // Get data
    const [total, services] = await Promise.all([
      collection.countDocuments(query),
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
    ]);

    const sanitizedProperties = services.map(({ _id, ...prop }) => ({
      ...prop,
      id: _id.toString(),
    }));

    return NextResponse.json({
      success: true,
      services: sanitizedProperties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Get services error:", error);

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
