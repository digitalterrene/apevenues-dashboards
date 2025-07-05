import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(
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

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      businessType: string;
    };

    const serviceData = await request.json();
    // Only allow service providers to offer services
    if (serviceData.businessType !== "service-provider") {
      return NextResponse.json(
        { error: "Only service providers can offer services" },
        { status: 403 }
      );
    }
    // Validate required fields
    const requiredFields = ["serviceId", "price", "duration"];
    const missingFields = requiredFields.filter((field) => !serviceData[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate property ID
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    // Validate service ID
    if (!ObjectId.isValid(serviceData.serviceId)) {
      return NextResponse.json(
        { error: "Invalid service ID" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Check if property exists
    const property = await db.collection("properties").findOne({
      _id: new ObjectId(params.id),
    });

    if (!property) {
      await client.close();
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Check if service exists and belongs to the provider
    const service = await db.collection("services").findOne({
      _id: new ObjectId(serviceData.serviceId),
      user_id: decoded.userId,
    });

    if (!service) {
      await client.close();
      return NextResponse.json(
        { error: "Service not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if service is already offered to this property
    const existingOffer = await db.collection("property_services").findOne({
      propertyId: new ObjectId(params.id),
      serviceId: new ObjectId(serviceData.serviceId),
      providerId: new ObjectId(decoded.userId),
    });

    if (existingOffer) {
      await client.close();
      return NextResponse.json(
        { error: "This service is already offered to this property" },
        { status: 409 }
      );
    }

    // Create new service offer
    const newOffer = {
      serviceId: new ObjectId(serviceData.serviceId),
      providerId: new ObjectId(decoded.userId),
      propertyId: new ObjectId(params.id),
      price: serviceData.price,
      duration: serviceData.duration,
      description: serviceData.description || service.description,
      terms: serviceData.terms,
      isActive:
        serviceData.isActive !== undefined ? serviceData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to property_services collection
    const result = await db.collection("property_services").insertOne(newOffer);

    // Also add reference to the property's services array
    await db.collection("properties").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $addToSet: {
          services: {
            serviceId: new ObjectId(serviceData.serviceId),
            offerId: result.insertedId,
            providerId: new ObjectId(decoded.userId),
            ...serviceData,
          },
        },
      }
    );

    await client.close();

    return NextResponse.json(
      {
        success: true,
        message: "Service successfully offered to property",
        offerId: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add service to property error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate property ID
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Get all services offered to this property
    const services = await db
      .collection("property_services")
      .aggregate([
        {
          $match: {
            propertyId: new ObjectId(params.id),
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "services",
            localField: "serviceId",
            foreignField: "_id",
            as: "serviceDetails",
          },
        },
        { $unwind: "$serviceDetails" },
        {
          $lookup: {
            from: "users",
            localField: "providerId",
            foreignField: "_id",
            as: "providerDetails",
          },
        },
        { $unwind: "$providerDetails" },
        {
          $project: {
            _id: 0,
            id: "$_id",
            name: "$serviceDetails.name",
            description: "$serviceDetails.description",
            providerName: "$providerDetails.businessName",
            providerId: "$providerDetails._id",
            price: 1,
            duration: 1,
            terms: 1,
            createdAt: 1,
          },
        },
      ])
      .toArray();

    await client.close();

    return NextResponse.json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("Get property services error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      businessType: string;
    };
    const { serviceId, businessType } = await request.json();

    // Only allow service providers to remove services
    if (businessType !== "service-provider") {
      return NextResponse.json(
        { error: "Only service providers can remove services" },
        { status: 403 }
      );
    }

    // Validate property ID
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    // Validate service ID
    if (!ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { error: "Invalid service ID" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Check if the service offer exists and belongs to this provider
    const existingOffer = await db.collection("property_services").findOne({
      propertyId: new ObjectId(params.id),
      serviceId: new ObjectId(serviceId),
      providerId: new ObjectId(decoded.userId),
    });

    if (!existingOffer) {
      await client.close();
      return NextResponse.json(
        { error: "Service offer not found or unauthorized" },
        { status: 404 }
      );
    }

    // Soft delete the service offer (set isActive to false)
    const result = await db.collection("property_services").updateOne(
      {
        _id: existingOffer._id,
      },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      }
    );

    // Remove reference from the property's services array
    await db.collection("properties").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $pull: {
          services: {
            serviceId: new ObjectId(serviceId),
            providerId: new ObjectId(decoded.userId),
          } as const, // Add type assertion here
        },
      }
    );

    await client.close();

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to remove service from property" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service successfully removed from property",
    });
  } catch (error) {
    console.error("Remove service from property error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
