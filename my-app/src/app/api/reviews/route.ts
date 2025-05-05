import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// GET users with at least one "poor" review and the rental unit title
export async function GET(req: NextRequest) {
  try {
    const query = `
      SELECT DISTINCT u.username, r.title AS unitTitle
      FROM review rv
      JOIN rental_unit r ON rv.rental_id = r.id
      JOIN user u ON rv.username = u.username
      WHERE rv.rating = 'poor'
    `;

    const reviews = await executeQuery<any[]>({
      query,
      values: [],
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching reviews with poor ratings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
