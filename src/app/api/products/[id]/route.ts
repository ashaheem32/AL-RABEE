import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/product-store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return NextResponse.json(
      { success: false, data: null, message: 'Product not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: product,
    message: 'Product retrieved successfully',
  });
}
