import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface BookingRequest {
  propertyId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  guestCount: number;
  specialRequests?: string;
}

export async function POST(request: Request) {
  try {
    const bookingData: BookingRequest = await request.json();

    // Validate required fields
    if (
      !bookingData.propertyId ||
      !bookingData.customerName ||
      !bookingData.customerEmail ||
      !bookingData.eventDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Verify property exists
    const property = await db.collection("properties").findOne({
      _id: new ObjectId(bookingData.propertyId),
    });

    if (!property) {
      await client.close();
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Create new booking
    const newBooking = {
      ...bookingData,
      propertyName: property.name,
      businessId: property.businessId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(newBooking);
    await client.close();

    return NextResponse.json(
      {
        success: true,
        booking: {
          ...newBooking,
          id: result.insertedId.toString(),
          _id: undefined,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
