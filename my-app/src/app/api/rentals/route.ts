import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
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
    // Get auth token from cookie
    const authToken = req.cookies.get("authToken")?.value;

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(authToken);
    if (!decoded || !decoded.username) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const username = decoded.username;

    // Check daily posting limit (2 per day)
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Get or create daily count record
    const countResult = await executeQuery<any[]>({
      query: "SELECT * FROM user_rental_count WHERE username = ?",
      values: [username],
    });

    let currentCount = 0;

    if (countResult.length > 0) {
      const record = countResult[0];
      // If record is from today, use current count
      if (record.date === today) {
        currentCount = record.count;

        // Check if user has reached daily limit
        if (currentCount >= 2) {
          return NextResponse.json(
            {
              success: false,
              message: "Daily posting limit reached (2 per day)",
            },
            { status: 403 }
          );
        }
      } else {
        // Reset count for new day
        await executeQuery({
          query:
            "UPDATE user_rental_count SET count = 0, date = ? WHERE username = ?",
          values: [today, username],
        });
      }
    } else {
      // Create new count record
      await executeQuery({
        query:
          "INSERT INTO user_rental_count (username, count, date) VALUES (?, 0, ?)",
        values: [username, today],
      });
    }

    // Parse request body
    const { title, description, features, price } = await req.json();

    // Validate required fields
    if (!title || !description || !features || !price) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Insert rental unit
    const result = await executeQuery({
      query: `
        INSERT INTO rental_unit (username, title, description, features, price)
        VALUES (?, ?, ?, ?, ?)
      `,
      values: [username, title, description, features, price],
    });

    // Increment user's daily count
    await executeQuery({
      query:
        "UPDATE user_rental_count SET count = count + 1 WHERE username = ?",
      values: [username],
    });

    return NextResponse.json(
      { success: true, message: "Rental unit created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating rental unit:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create rental unit" },
      { status: 500 }
    );
  }
}
