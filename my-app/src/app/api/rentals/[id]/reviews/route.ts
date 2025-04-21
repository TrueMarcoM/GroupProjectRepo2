import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET reviews for a rental unit
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rentalId = params.id;

    const reviews = await executeQuery<any[]>({
      query: `
        SELECT r.*, u.firstName, u.lastName 
        FROM review r
        JOIN user u ON r.username = u.username
        WHERE r.rental_id = ?
        ORDER BY r.created_at DESC
      `,
      values: [rentalId],
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST new review
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const rentalId = resolvedParams.id;

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

    // Check if user is reviewing their own rental
    const rentalOwner = await executeQuery<any[]>({
      query: "SELECT username FROM rental_unit WHERE id = ?",
      values: [rentalId],
    });

    if (rentalOwner.length === 0) {
      return NextResponse.json(
        { success: false, message: "Rental unit not found" },
        { status: 404 }
      );
    }

    if (rentalOwner[0].username === username) {
      return NextResponse.json(
        { success: false, message: "You cannot review your own rental unit" },
        { status: 403 }
      );
    }

    // Check if user already reviewed this rental
    const existingReview = await executeQuery<any[]>({
      query: "SELECT id FROM review WHERE rental_id = ? AND username = ?",
      values: [rentalId, username],
    });

    if (existingReview.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already reviewed this rental unit",
        },
        { status: 403 }
      );
    }

    // Check daily review limit (3 per day)
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const [countResult] = await executeQuery<any[]>({
      query: `
        SELECT count FROM user_review_count 
        WHERE username = ? AND post_date = ?
      `,
      values: [username, today],
    });

    const currentCount = countResult?.count || 0;

    if (currentCount >= 3) {
      return NextResponse.json(
        {
          success: false,
          message: "You have reached the daily limit of 3 reviews",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const { rating, description } = await req.json();

    // Validate required fields
    if (!rating || !description) {
      return NextResponse.json(
        { success: false, message: "Rating and description are required" },
        { status: 400 }
      );
    }

    // Validate rating
    if (!["excellent", "good", "fair", "poor"].includes(rating)) {
      return NextResponse.json(
        { success: false, message: "Invalid rating" },
        { status: 400 }
      );
    }

    // Insert review
    await executeQuery({
      query: `
        INSERT INTO review (rental_id, username, rating, description)
        VALUES (?, ?, ?, ?)
      `,
      values: [rentalId, username, rating, description],
    });

    // Update review count
    await executeQuery({
      query: `
        INSERT INTO user_review_count (username, post_date, count)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE count = count + 1
      `,
      values: [username, today],
    });

    return NextResponse.json(
      { success: true, message: "Review submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    );
  }
}
