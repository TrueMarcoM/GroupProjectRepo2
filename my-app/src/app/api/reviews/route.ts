import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// GET users with at least one "poor" review
export async function GET(req: NextRequest) {
  try {
    const query = `
      SELECT DISTINCT username 
      FROM review 
      WHERE rating = 'poor'
    `;

    const users = await executeQuery<any[]>({
      query,
      values: [],
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users with poor reviews:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
