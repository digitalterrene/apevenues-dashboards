//api/services/requests/route.ts
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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

// api/services/requests/route.ts
export async function GET(request: Request) {
  let client;
  try {
    // Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const businessId = decoded?.userId;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";

    client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Base query
    const query: any = {};

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { addressRequestingService: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (filter === "accepted_by_me") {
      query.acceptedBy = businessId;
    }

    const total = await db.collection("serviceRequests").countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    let requests = await db
      .collection("serviceRequests")
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Add isAllowedToAccept field to each request
    requests = requests.map((request) => {
      const acceptedCount = request.acceptedBy?.length || 0;
      const hasAccepted =
        businessId && request.acceptedBy?.includes(businessId);
      const isOpenForAcceptance =
        (request.status === "open" || request.status === "in_progress") &&
        acceptedCount < 5 &&
        !hasAccepted;

      return {
        ...request,
        id: request._id.toString(),
        acceptedByCount: acceptedCount,
        isAllowedToAccept: isOpenForAcceptance,
      };
    });

    return NextResponse.json({
      serviceRequests: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Fetch service requests error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function PUT(request: Request) {
  let client;
  try {
    // Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const businessId = decoded?.userId;
    const { id } = await request.json();

    // Validation
    if (!id || !businessId) {
      return NextResponse.json(
        {
          error: "ID and business ID are required",
          code: "MISSING_REQUIRED_FIELDS",
        },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Fetch current request
    const currentRequest = await db
      .collection("serviceRequests")
      .findOne({ _id: new ObjectId(id) });

    if (!currentRequest) {
      return NextResponse.json(
        { error: "Service request not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Check business rules
    const acceptedBy = currentRequest.acceptedBy || [];
    const acceptedCount = acceptedBy.length;

    // Rule 1: Already accepted by this business
    if (acceptedBy.includes(businessId)) {
      return NextResponse.json(
        {
          error: "You have already accepted this request",
          code: "ALREADY_ACCEPTED",
        },
        { status: 400 }
      );
    }

    // Rule 2: Maximum acceptances reached
    if (acceptedCount >= 5) {
      return NextResponse.json(
        {
          error: "Maximum providers (5) have already accepted this request",
          code: "MAX_ACCEPTANCES_REACHED",
        },
        { status: 400 }
      );
    }

    // Rule 3: Request must be open or in_progress
    if (!["open", "in_progress"].includes(currentRequest.status)) {
      return NextResponse.json(
        {
          error: "This request is no longer accepting providers",
          code: "REQUEST_NOT_ACCEPTING",
        },
        { status: 400 }
      );
    }

    // Prepare update
    const newAcceptedBy = [...acceptedBy, businessId];
    let newStatus = currentRequest.status;

    // Update status to in_progress if this is the first acceptance
    if (newAcceptedBy.length === 1 && currentRequest.status === "open") {
      newStatus = "in_progress";
    }

    // Execute update
    const result = await db.collection("serviceRequests").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          acceptedBy: newAcceptedBy,
          acceptedByCount: newAcceptedBy.length,
          status: newStatus,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Service request not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: "Service request accepted successfully",
      data: {
        status: newStatus,
        acceptedByCount: newAcceptedBy.length,
      },
    });
  } catch (error) {
    console.error("Accept service request error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function POST(request: Request) {
  let client;
  try {
    const serviceRequestData = await request.json();

    // Validate required fields
    if (
      !serviceRequestData.customerName ||
      !serviceRequestData.customerEmail ||
      !serviceRequestData.customerPhone ||
      !serviceRequestData.selectedServices ||
      serviceRequestData.selectedServices.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          code: "MISSING_REQUIRED_FIELDS",
          details: {
            missingFields: [
              !serviceRequestData.customerName && "customerName",
              !serviceRequestData.customerEmail && "customerEmail",
              !serviceRequestData.customerPhone && "customerPhone",
              (!serviceRequestData.selectedServices ||
                serviceRequestData.selectedServices.length === 0) &&
                "selectedServices",
            ].filter(Boolean),
          },
        },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Create new service request
    const newServiceRequest = {
      ...serviceRequestData,
      status: "open",
      acceptedBy: [],
      totalCost: serviceRequestData.selectedServices.reduce(
        (total: number, service: any) => total + (service.price || 0),
        0
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("serviceRequests")
      .insertOne(newServiceRequest);

    return NextResponse.json(
      {
        success: true,
        serviceRequest: {
          ...newServiceRequest,
          id: result.insertedId.toString(),
          _id: undefined,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create service request error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
