import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const results = await executeQuery({
      query: `
        SELECT 
          u.username, 
          u.firstName, 
          u.lastName,
          COUNT(r.id) as review_count
        FROM user u
        JOIN review r ON u.username = r.username
        GROUP BY u.username
        HAVING MIN(r.rating) = 'poor' AND MAX(r.rating) = 'poor'
      `,
      values: [],
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error fetching users with only poor reviews:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
