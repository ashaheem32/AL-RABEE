import { NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/product-store';
import { isAdminAuthenticated, unauthorizedResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// Get single product
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  const { id } = await params;
  const product = getProductById(id);
  if (!product) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: product });
}

// Update product (partial update)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  const { id } = await params;
  try {
    const body = await request.json();

    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.description !== undefined) patch.description = body.description;
    if (body.price !== undefined) patch.price = Number(body.price);
    if (body.category !== undefined) patch.category = body.category;
    if (body.image !== undefined) patch.image = body.image;
    if (body.isTopSelling !== undefined) patch.isTopSelling = Boolean(body.isTopSelling);
    if (body.isFeatured !== undefined) patch.isFeatured = Boolean(body.isFeatured);

    // Handle discount — allow setting to 0 or null to remove
    if (body.discount !== undefined) {
      patch.discount = body.discount === null || body.discount === 0 || body.discount === ''
        ? undefined
        : Number(body.discount);
    }

    // Handle inventory
    if (body.storeStock !== undefined || body.warehouseStock !== undefined) {
      patch.inventory = {};
      if (body.storeStock !== undefined) (patch.inventory as Record<string, number>).store = Number(body.storeStock);
      if (body.warehouseStock !== undefined) (patch.inventory as Record<string, number>).warehouse = Number(body.warehouseStock);
    }

    // Handle location
    if (body.aisle !== undefined || body.section !== undefined) {
      patch.location = {};
      if (body.aisle !== undefined) (patch.location as Record<string, string>).aisle = body.aisle;
      if (body.section !== undefined) (patch.location as Record<string, string>).section = body.section;
    }

    const updated = updateProduct(id, patch as never);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated, message: 'Product updated' });
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}

// Delete product
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();

  const { id } = await params;
  const ok = deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Deleted' });
}
