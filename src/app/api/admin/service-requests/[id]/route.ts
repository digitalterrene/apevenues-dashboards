//api/admin/service-requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Validate ID
    if (!ObjectId.isValid(params.id)) {
      await client.close();
      return NextResponse.json(
        { error: "Invalid service request ID" },
        { status: 400 }
      );
    }

    const serviceRequest = await db
      .collection("serviceRequests")
      .findOne({ _id: new ObjectId(params.id) });

    await client.close();

    if (!serviceRequest) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(serviceRequest, { status: 200 });
  } catch (error: any) {
    console.error("Get service request error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();
    const updateData = await req.json();

    // Validate ID
    if (!ObjectId.isValid(params.id)) {
      await client.close();
      return NextResponse.json(
        { error: "Invalid service request ID" },
        { status: 400 }
      );
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    const result = await db
      .collection("serviceRequests")
      .updateOne({ _id: new ObjectId(params.id) }, { $set: updateData });

    await client.close();

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    // Get updated service request
    const updatedServiceRequest = await db
      .collection("serviceRequests")
      .findOne({ _id: new ObjectId(params.id) });

    return NextResponse.json(updatedServiceRequest, { status: 200 });
  } catch (error: any) {
    console.error("Update service request error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Validate ID
    if (!ObjectId.isValid(params.id)) {
      await client.close();
      return NextResponse.json(
        { error: "Invalid service request ID" },
        { status: 400 }
      );
    }

    const result = await db
      .collection("serviceRequests")
      .deleteOne({ _id: new ObjectId(params.id) });

    await client.close();

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Service request deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete service request error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
