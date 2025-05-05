import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username") || "";

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    const results = await executeQuery({
      query: `
        SELECT r.* 
        FROM rental_unit r
        WHERE r.username = ?
          AND EXISTS (
            SELECT 1 FROM review rev WHERE rev.rental_id = r.id
          )
          AND NOT EXISTS (
            SELECT 1 FROM review rev 
            WHERE rev.rental_id = r.id 
              AND rev.rating NOT IN ('excellent', 'good')
          )
      `,
      values: [username],
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error fetching good/excellent only units:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
