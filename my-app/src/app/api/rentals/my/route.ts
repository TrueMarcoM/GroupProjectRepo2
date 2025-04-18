import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

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

    const username = decoded.username;

    // Get user's rental units
    const rentalUnits = await executeQuery<any[]>({
      query:
        "SELECT * FROM rental_unit WHERE username = ? ORDER BY created_at DESC",
      values: [username],
    });

    return NextResponse.json({ success: true, rentalUnits });
  } catch (error) {
    console.error("Error fetching user's rental units:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch rental units" },
      { status: 500 }
    );
  }
}
