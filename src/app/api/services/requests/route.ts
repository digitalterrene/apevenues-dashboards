//api/services/requests/route.ts
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

interface ServiceRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  selectedServices: Array<{
    id: string;
    name: string;
    price: number;
    duration: string;
    category: string;
  }>;
  addressRequestingService?: string;
  customerWhatsApp?: string;
  eventDate?: string;
}

export async function POST(request: Request) {
  try {
    const serviceRequestData: ServiceRequest = await request.json();

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

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Create new service request
    const newServiceRequest = {
      ...serviceRequestData,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      totalCost: serviceRequestData.selectedServices.reduce(
        (total, service) => total + service.price,
        0
      ),
    };

    const result = await db
      .collection("serviceRequests")
      .insertOne(newServiceRequest);
    await client.close();

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
  }
}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") || "all";
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    const query: any = {
      "selectedServices.category": { $exists: true }, // Ensure we're getting service requests
    };

    if (statusFilter !== "all") {
      query.status = statusFilter;
    }

    const serviceRequests = await db
      .collection("serviceRequests")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    const sanitizedRequests = serviceRequests.map(({ _id, ...request }) => ({
      ...request,
      id: _id.toString(),
    }));

    return NextResponse.json({ serviceRequests: sanitizedRequests });
  } catch (error) {
    console.error("Get service requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "accepted", "rejected", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    const result = await db
      .collection("serviceRequests")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
      );

    await client.close();

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service request updated successfully",
    });
  } catch (error) {
    console.error("Update service request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Service request ID is required" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    const result = await db
      .collection("serviceRequests")
      .deleteOne({ _id: new ObjectId(id) });

    await client.close();

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service request deleted successfully",
    });
  } catch (error) {
    console.error("Delete service request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
