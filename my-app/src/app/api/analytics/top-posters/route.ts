import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const dateStr = req.nextUrl.searchParams.get("date") || "2025-04-15";

    // First find the maximum number of posts for the given date
    const maxPosts = await executeQuery({
      query: `
        SELECT COUNT(*) as count
        FROM rental_unit
        WHERE DATE(created_at) = ?
        GROUP BY username
        ORDER BY count DESC
        LIMIT 1
      `,
      values: [dateStr],
    });

    // If no posts were made on that day
    if (!maxPosts || maxPosts.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        message: "No posts were found for this date",
      });
    }

    const maxCount = maxPosts[0].count;

    // Find all users with the maximum number of posts
    const results = await executeQuery({
      query: `
        SELECT 
          u.username, 
          u.firstName, 
          u.lastName, 
          COUNT(*) as post_count
        FROM rental_unit r
        JOIN user u ON r.username = u.username
        WHERE DATE(r.created_at) = ?
        GROUP BY r.username
        HAVING post_count = ?
        ORDER BY u.username
      `,
      values: [dateStr, maxCount],
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error fetching top posters:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
