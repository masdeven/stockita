import { db } from '../database';
import type { Category } from '../../types';

export async function createCategory(category: Category) {
  await db.categories.put(category);
}

export async function updateCategory(category: Category) {
  await db.categories.put(category);
}

export async function deleteCategory(id: string) {
  // Safe delete: unlinks category from any products referencing it
  await db.transaction('rw', db.categories, db.products, async () => {
    await db.products.where('categoryId').equals(id).modify({ categoryId: undefined });
    await db.categories.delete(id);
  });
}
