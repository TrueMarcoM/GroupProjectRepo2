import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeTransaction } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET all rental units
export async function GET(req: NextRequest) {
  try {
    const feature = req.nextUrl.searchParams.get("feature");

    let query = "SELECT * FROM rental_unit";
    let values: any[] = [];

    if (feature) {
      query = `SELECT * FROM rental_unit WHERE features LIKE ?`;
      values = [`%${feature}%`];
    }

    const rentalUnits = await executeQuery<any[]>({
      query,
      values,
    });

    return NextResponse.json({ success: true, rentalUnits });
  } catch (error) {
    console.error("Error fetching rental units:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch rental units" },
      { status: 500 }
    );
  }
}

// POST new rental unit
export async function POST(req: NextRequest) {
  try {
    // Get auth token and verify user
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded?.username) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const username = decoded.username;
    const today = new Date().toISOString().split("T")[0];

    // Check daily post count
    const [countResult] = await executeQuery<any[]>({
      query: `
        SELECT count FROM user_rental_count 
        WHERE username = ? AND post_date = ?
      `,
      values: [username, today],
    });

    const currentCount = countResult?.count || 0;

    if (currentCount >= 2) {
      return NextResponse.json(
        {
          success: false,
          message: "You have reached the daily limit of 2 rental posts",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const { title, description, features, price } = await req.json();

    // Validate inputs
    if (!title || !description || !features || !price) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Execute transaction
    await executeTransaction([
      {
        query: `
          INSERT INTO rental_unit 
          (username, title, description, features, price)
          VALUES (?, ?, ?, ?, ?)
        `,
        values: [username, title, description, features, price],
      },
      {
        query: `
          INSERT INTO user_rental_count (username, post_date, count)
          VALUES (?, ?, 1)
          ON DUPLICATE KEY UPDATE count = count + 1
        `,
        values: [username, today],
      },
    ]);

    return NextResponse.json(
      { success: true, message: "Rental unit created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating rental:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create rental unit" },
      { status: 500 }
    );
  }
}
