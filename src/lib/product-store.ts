/**
 * Server-side in-memory product store.
 * Both admin and customer API routes import from here so mutations
 * made by the admin are instantly visible to customers.
 *
 * NOTE: data resets when the dev server restarts.
 */
import { Product } from './types';
import { products as seedProducts, stores as seedStores, categories as seedCategories } from './mock-data';

// Deep-clone seed data so the original module stays untouched
let _products: Product[] = JSON.parse(JSON.stringify(seedProducts));
let _nextId = Math.max(..._products.map(p => parseInt(p.id, 10))) + 1;

// ─── Read ────────────────────────────────────────────────────────
export function getAllProducts(): Product[] {
  return _products;
}

export function getProductById(id: string): Product | undefined {
  return _products.find(p => p.id === id);
}

// ─── Create ──────────────────────────────────────────────────────
export function addProduct(data: Omit<Product, 'id'>): Product {
  const product: Product = { ...data, id: String(_nextId++) };
  _products.push(product);
  return product;
}

// ─── Update ──────────────────────────────────────────────────────
export function updateProduct(id: string, patch: Partial<Omit<Product, 'id'>>): Product | null {
  const idx = _products.findIndex(p => p.id === id);
  if (idx === -1) return null;

  const existing = _products[idx];
  _products[idx] = {
    ...existing,
    ...patch,
    // deep-merge nested objects
    location: { ...existing.location, ...(patch.location ?? {}) },
    inventory: { ...existing.inventory, ...(patch.inventory ?? {}) },
  };
  return _products[idx];
}

// ─── Delete ──────────────────────────────────────────────────────
export function deleteProduct(id: string): boolean {
  const before = _products.length;
  _products = _products.filter(p => p.id !== id);
  return _products.length < before;
}

// Re-export stores & categories unchanged
export { seedStores as stores, seedCategories as categories };
