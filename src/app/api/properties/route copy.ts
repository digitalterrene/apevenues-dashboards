import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Property, PropertyInput } from "@/types/property";
import { createLogger } from "@/lib/logger";
import { MongoClient } from "mongodb";

const logger = createLogger("properties-api");

const verifyToken = async (token: string): Promise<{ userId: string }> => {
  return new Promise((resolve, reject) => {
    if (!process.env.JWT_SECRET) {
      return reject(new Error("JWT_SECRET not configured"));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
        return reject(new Error("Invalid token payload"));
      }
      resolve(decoded as { userId: string });
    });
  });
};

const validatePropertyInput = (data: any): PropertyInput => {
  const requiredFields = ["name", "type", "address"];
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  return data as PropertyInput;
};

export async function POST(request: Request) {
  try {
    // Validate environment
    if (!process.env.JWT_SECRET) {
      throw new Error("Server configuration error");
    }

    // Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      logger.warn("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    // Input validation
    let propertyData: PropertyInput;
    try {
      propertyData = await request.json().then(validatePropertyInput);
    } catch (error) {
      logger.warn("Invalid request payload", { error });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid request" },
        { status: 400 }
      );
    }

    // Database operations
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    const collection = db.collection<Property>("properties");

    const newProperty: Property = {
      ...propertyData,
      user_id: decoded.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    const result = await collection.insertOne(newProperty);
    logger.info(`Property created: ${result.insertedId}`);

    return NextResponse.json(
      {
        success: true,
        property: {
          ...newProperty,
          id: result.insertedId.toString(),
          _id: undefined,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Create property error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (error instanceof Error && error.name === "MongoNetworkError") {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
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
        logger.warn(
          "Authentication error (non-critical for public listings):",
          authError
        );
      }
    }

    // Query parameters
    const { searchParams } = new URL(request.url);
    const fetchMyProperties = searchParams.get("userId");
    const typeFilter = searchParams.get("type");
    const cityFilter = searchParams.get("city");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );

    // Database operations
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const collection = db.collection<Property>("properties");

    // Build query
    const query: any = { isActive: true };
    if (fetchMyProperties && userId) {
      query.user_id = userId;
    }
    if (typeFilter && typeFilter !== "all") {
      query.type = typeFilter;
    }
    if (cityFilter && cityFilter !== "all") {
      query.city = cityFilter;
    }

    // Get total count and paginated results in parallel
    const [total, properties] = await Promise.all([
      collection.countDocuments(query),
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
    ]);

    const sanitizedProperties = properties.map(({ _id, ...prop }) => ({
      ...prop,
      id: _id.toString(),
    }));

    logger.info(`Fetched ${properties.length} properties`);

    return NextResponse.json({
      success: true,
      properties: sanitizedProperties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Get properties error:", error);

    if (error instanceof Error && error.name === "MongoNetworkError") {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
