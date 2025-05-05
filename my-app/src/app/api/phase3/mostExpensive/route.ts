import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
    const features: string[] = ['kitchen', 'wi-fi'];
    const results: any[] = [];

    for (const feature of features) {
        const rows = await executeQuery<any[]>({
            query: `
                SELECT * FROM rental_unit
                WHERE features LIKE ?
                ORDER BY price DESC
                    LIMIT 1
            `,
            values: [`%${feature}%`],
        });

        if (rows.length > 0) {
            results.push({ feature, rental: rows[0] });
        }
    }

    return NextResponse.json(results);
}
