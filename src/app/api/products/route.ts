import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/product-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const discountOnly = searchParams.get('discountOnly') === 'true';
  const topSelling = searchParams.get('topSelling') === 'true';
  const featured = searchParams.get('featured') === 'true';

  let filteredProducts = [...getAllProducts()];

  if (category && category !== 'All') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
    );
  }

  if (discountOnly) {
    filteredProducts = filteredProducts.filter(p => p.discount && p.discount > 0);
  }

  if (topSelling) {
    filteredProducts = filteredProducts.filter(p => p.isTopSelling);
  }

  if (featured) {
    filteredProducts = filteredProducts.filter(p => p.isFeatured);
  }

  return NextResponse.json({
    success: true,
    data: filteredProducts,
    message: 'Products retrieved successfully',
    totalCount: filteredProducts.length,
  });
}
