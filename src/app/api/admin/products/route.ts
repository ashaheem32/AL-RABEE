import { NextResponse } from 'next/server';
import { getAllProducts, addProduct } from '@/lib/product-store';
import { isAdminAuthenticated, unauthorizedResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// List all products (admin view — includes everything)
export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  const products = getAllProducts();

  // Build summary stats
  const outOfStock = products.filter(p => p.inventory.store + p.inventory.warehouse === 0).length;
  const lowStock = products.filter(p => {
    const total = p.inventory.store + p.inventory.warehouse;
    return total > 0 && total < 50;
  }).length;
  const withOffers = products.filter(p => p.discount && p.discount > 0).length;

  return NextResponse.json({
    success: true,
    data: products,
    stats: { total: products.length, outOfStock, lowStock, withOffers },
    message: 'Admin products retrieved',
  });
}

// Add a new product
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  try {
    const body = await request.json();

    // Validate required fields
    const required = ['name', 'price', 'category', 'image'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const product = addProduct({
      name: body.name,
      description: body.description || '',
      price: Number(body.price),
      category: body.category,
      image: body.image,
      discount: body.discount ? Number(body.discount) : undefined,
      isTopSelling: Boolean(body.isTopSelling),
      isFeatured: Boolean(body.isFeatured),
      location: {
        aisle: body.aisle || 'TBD',
        section: body.section || 'General',
      },
      inventory: {
        store: Number(body.storeStock ?? 0),
        warehouse: Number(body.warehouseStock ?? 0),
      },
    });

    return NextResponse.json(
      { success: true, data: product, message: 'Product created' },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    );
  }
}
