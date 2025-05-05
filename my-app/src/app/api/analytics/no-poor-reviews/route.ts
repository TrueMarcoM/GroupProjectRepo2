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
          COUNT(DISTINCT r.id) as rental_count
        FROM user u
        JOIN rental_unit r ON u.username = r.username
        LEFT JOIN review rev ON r.id = rev.rental_id AND rev.rating = 'poor'
        GROUP BY u.username
        HAVING 
          rental_count > 0 AND
          COUNT(rev.id) = 0
      `,
      values: [],
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error fetching users with no poor reviews:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
