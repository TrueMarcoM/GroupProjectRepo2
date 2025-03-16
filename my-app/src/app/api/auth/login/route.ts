import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, generateToken } from "@/lib/auth";
import { validateLogin } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { username, password } = await req.json();

    // Validate input
    const validation = validateLogin({ username, password });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(username, password);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user.username);

    // Set HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "authToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to login" },
      { status: 500 }
    );
  }
}
