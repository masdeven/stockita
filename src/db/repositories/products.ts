import { db } from '../db/database';
import type { Product, Transaction } from '../types';
import { normalizeSku } from '../lib/format';

export async function ensureUniqueSku(sku: string, excludeId?: string) {
  const normalized = normalizeSku(sku);
  const found = await db.products.where('sku').equalsIgnoreCase(normalized).first();
  if (!found) return true;
  if (excludeId && found.id === excludeId) return true;
  return false;
}

export async function createProduct(product: Product) {
  // SKU uniqueness enforced by caller
  await db.products.put(product);
}

export async function updateProduct(product: Product) {
  await db.products.put(product);
}

export async function deleteProduct(id: string) {
  await db.products.delete(id);
}
