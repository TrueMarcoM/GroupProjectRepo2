gimport { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUserByUsername } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get auth token from cookie
    const authToken = req.cookies.get("authToken")?.value;

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(authToken);
    if (!decoded || !decoded.username) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Get user data
    const user = await getUserByUsername(decoded.username);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(
      { success: true, user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error("Authentication check error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication check failed" },
      { status: 500 }
    );
  }
}
