// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface LoginData {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }

    const loginData: LoginData = await request.json();

    // Validate required fields
    if (!loginData.email || !loginData.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginData.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db();

    try {
      // Find user by email
      const user = await db.collection("users").findOne({
        email: loginData.email,
        isActive: true, // Only allow login for active accounts
      });

      if (!user) {
        // Use generic message for security (don't reveal if email exists)
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Create JWT token (consistent with signup)
      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role || "business",
        },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      // Set cookie (consistent with signup)
      const cookieStore = await cookies();
      cookieStore.set({
        name: "authToken",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
        sameSite: "strict",
      });

      // Return user data (consistent with signup response structure)
      return NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          businessName: user.businessName,
          contactPerson: user.contactPerson,
          role: user.role || "business",
        },
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Login error:", error);

    // Provide appropriate error responses
    if (error instanceof Error) {
      if (
        error.message.includes("MONGODB_URI") ||
        error.message.includes("JWT_SECRET")
      ) {
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
