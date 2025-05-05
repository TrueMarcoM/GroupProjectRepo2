import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// GET users who have posted units, and none of their posted units have poor reviews
export async function GET(req: NextRequest) {
  try {
    const query = `
      SELECT DISTINCT u.username, u.firstName, u.lastName, u.email, u.phone
      FROM user u
      JOIN rental_unit ru ON u.username = ru.username
      WHERE NOT EXISTS (
        SELECT 1
        FROM review r
        WHERE r.rental_id = ru.id AND r.rating = 'poor'
      )
    `;

    const users = await executeQuery<any[]>({
      query,
      values: [],
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users with no negative reviews:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
