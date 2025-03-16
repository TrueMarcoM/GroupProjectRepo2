import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Create response that clears the auth cookie
    const response = NextResponse.json(
      { success: true, message: "Logout successful" },
      { status: 200 }
    );

    // Clear the auth cookie
    response.cookies.delete("authToken");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}
