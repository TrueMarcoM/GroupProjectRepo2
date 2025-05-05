import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // This query finds the most expensive rental for each feature
    // It first creates a list of all unique features by splitting the features column
    // Then for each feature, finds the rental with max price
    const results = await executeQuery({
      query: `
        WITH feature_list AS (
          SELECT 
            id,
            username,
            title,
            description,
            price,
            created_at,
            TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(features, ',', numbers.n), ',', -1)) AS feature
          FROM
            rental_unit
          JOIN
            (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) numbers
          ON
            LENGTH(features) - LENGTH(REPLACE(features, ',', '')) >= numbers.n - 1
        )
        SELECT 
          f1.feature,
          f1.id,
          f1.title,
          f1.price,
          f1.username
        FROM 
          feature_list f1
        JOIN (
          SELECT 
            feature, 
            MAX(price) AS max_price
          FROM 
            feature_list
          GROUP BY 
            feature
        ) f2 ON f1.feature = f2.feature AND f1.price = f2.max_price
        ORDER BY 
          f1.feature;
      `,
      values: [],
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error fetching most expensive units by feature:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
