import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
    try {
        const query = `
      SELECT username 
      FROM user_rental_count 
      WHERE post_date = '2025-04-15'
        AND count = (
          SELECT MAX(count) 
          FROM user_rental_count 
          WHERE post_date = '2025-04-15'
        );
    `;

        const results = await executeQuery<{ username: string }[]>({ query });

        return NextResponse.json({ topUsers: results });
    } catch (error) {
        console.error('Error in mostPosts route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
