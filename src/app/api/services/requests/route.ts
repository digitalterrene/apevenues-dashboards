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

export async function GET(request: Request) {
  let client;
  try {
    // Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const businessId = decoded?.userId;
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const filter = searchParams.get("filter") || "all"; // 'all', 'accepted', 'open'

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Base query for all requests
    const allRequestsQuery: any = {};

    // Query for requests accepted by this business
    const acceptedRequestsQuery = { acceptedBy: businessId };

    // Query for open requests not yet accepted by this business
    const openRequestsQuery = {
      status: "open",
      acceptedBy: { $nin: [businessId] },
    };

    // Apply search if provided
    if (search) {
      const searchQuery = {
        $or: [
          { customerName: { $regex: search, $options: "i" } },
          { customerEmail: { $regex: search, $options: "i" } },
          { addressRequestingService: { $regex: search, $options: "i" } },
          { "selectedServices.name": { $regex: search, $options: "i" } },
        ],
      };

      allRequestsQuery.$and = [searchQuery];
      acceptedRequestsQuery.$and = [searchQuery];
      openRequestsQuery.$and = [searchQuery];
    }

    // Apply status filter if provided
    if (status && status !== "all") {
      allRequestsQuery.status = status;
      acceptedRequestsQuery.status = status;
      openRequestsQuery.status = status;
    }

    // Determine which query to use based on filter
    let finalQuery = allRequestsQuery;
    if (filter === "accepted") {
      finalQuery = { ...acceptedRequestsQuery };
    } else if (filter === "open") {
      finalQuery = { ...openRequestsQuery };
    }

    // Get counts for all categories in parallel
    const [
      totalRequests,
      openRequests,
      inProgressRequests,
      completedRequests,
      acceptedByMe,
      acceptedByMeOpen,
      acceptedByMeInProgress,
      acceptedByMeCompleted,
      filteredCount,
      requests,
    ] = await Promise.all([
      // Global counts
      db.collection("serviceRequests").countDocuments({}),
      db.collection("serviceRequests").countDocuments({ status: "open" }),
      db
        .collection("serviceRequests")
        .countDocuments({ status: "in_progress" }),
      db.collection("serviceRequests").countDocuments({ status: "completed" }),

      // Counts for this business
      db
        .collection("serviceRequests")
        .countDocuments({ acceptedBy: businessId }),
      db.collection("serviceRequests").countDocuments({
        acceptedBy: businessId,
        status: "open",
      }),
      db.collection("serviceRequests").countDocuments({
        acceptedBy: businessId,
        status: "in_progress",
      }),
      db.collection("serviceRequests").countDocuments({
        acceptedBy: businessId,
        status: "completed",
      }),

      // Filtered count and results
      db.collection("serviceRequests").countDocuments(finalQuery),
      db
        .collection("serviceRequests")
        .find(finalQuery)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
    ]);

    const sanitizedRequests = requests.map(({ _id, ...request }) => ({
      ...request,
      id: _id.toString(),
    }));

    return NextResponse.json({
      serviceRequests: sanitizedRequests,
      pagination: {
        page,
        limit,
        total: filteredCount,
        totalPages: Math.ceil(filteredCount / limit),
      },
      counts: {
        // Global counts
        total: totalRequests,
        open: openRequests,
        in_progress: inProgressRequests,
        completed: completedRequests,

        // Business-specific counts
        acceptedByMe,
        acceptedByMeOpen,
        acceptedByMeInProgress,
        acceptedByMeCompleted,
      },
    });
  } catch (error) {
    console.error("Get service requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const businessId = decoded?.userId;
    const { id } = await request.json();

    if (!id || !businessId) {
      return NextResponse.json(
        { error: "ID and business ID are required" },
        { status: 400 }
      );
    }

    client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // First get the current request
    const currentRequest = await db
      .collection("serviceRequests")
      .findOne({ _id: new ObjectId(id) });

    if (!currentRequest) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Check if business already accepted
    if (currentRequest.acceptedBy.includes(businessId)) {
      return NextResponse.json(
        { error: "You have already accepted this request" },
        { status: 400 }
      );
    }

    // Update the request
    const acceptedBy = [...currentRequest.acceptedBy, businessId];
    let newStatus = currentRequest.status;

    // Update status based on business type or other logic if needed
    if (newStatus === "open") {
      newStatus = "in_progress";
    }

    const result = await db.collection("serviceRequests").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          acceptedBy,
          status: newStatus,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service request accepted successfully",
      status: newStatus,
    });
  } catch (error) {
    console.error("Accept service request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
        { error: "Missing required fields" },
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
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
