import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const featureX = req.nextUrl.searchParams.get("featureX") || "";
    const featureY = req.nextUrl.searchParams.get("featureY") || "";

    if (!featureX || !featureY) {
      return NextResponse.json(
        { success: false, message: "Both features are required" },
        { status: 400 }
      );
    }

    const results = await executeQuery({
      query: `
        SELECT DISTINCT r1.username, u.firstName, u.lastName, DATE(r1.created_at) as post_date
        FROM rental_unit r1
        JOIN rental_unit r2 ON r1.username = r2.username 
          AND DATE(r1.created_at) = DATE(r2.created_at)
          AND r1.id <> r2.id
        JOIN user u ON r1.username = u.username
        WHERE r1.features LIKE ? 
          AND r2.features LIKE ?
      `,
      values: [`%${featureX}%`, `%${featureY}%`],
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error fetching users with same day features:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
