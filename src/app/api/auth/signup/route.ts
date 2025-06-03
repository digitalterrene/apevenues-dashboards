// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface UserData {
  email: string;
  password: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
}

export async function POST(request: Request) {
  try {
    const userData: UserData = await request.json();

    // Validate required fields
    if (!userData.email || !userData.password || !userData.businessName) {
      return NextResponse.json(
        { error: "Email, password, and business name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (userData.password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    // Check if user already exists
    const existingUser = await db
      .collection("users")
      .findOne({ email: userData.email });
    if (existingUser) {
      await client.close();
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create new user
    const newUser = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "business", // default role
      isActive: true,
    };

    const result = await db.collection("users").insertOne(newUser);
    const userId = result.insertedId.toString();

    // Create JWT token
    const token = jwt.sign(
      { userId, email: userData.email, role: "business" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Set cookie with token (HTTP Only, Secure in production)
    const cookieStore = await cookies();
    cookieStore.set({
      name: "authToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    await client.close();

    // Return success response without sensitive data
    return NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          email: userData.email,
          businessName: userData.businessName,
          contactPerson: userData.contactPerson,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
