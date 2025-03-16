import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { validateRegistration } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const {
      username,
      password,
      confirmPassword,
      firstName,
      lastName,
      email,
      phone,
    } = await req.json();

    // Validate input
    const validation = await validateRegistration({
      username,
      password,
      confirmPassword,
      firstName,
      lastName,
      email,
      phone,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in database
    await createUser({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      phone,
    });

    return NextResponse.json(
      { success: true, message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register user" },
      { status: 500 }
    );
  }
}
