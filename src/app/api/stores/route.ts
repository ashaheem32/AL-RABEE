import { NextResponse } from 'next/server';
import { stores } from '@/lib/product-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: stores,
    message: 'Stores retrieved successfully',
  });
}
