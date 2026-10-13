import { db } from '../database';
import type { Category } from '../../types';

export async function createCategory(category: Category) {
  await db.categories.put(category);
}

export async function updateCategory(category: Category) {
  await db.categories.put(category);
}

export async function deleteCategory(id: string) {
  // Before deleting, clear categoryId in products that reference it
  return db.transaction('rw', db.categories, db.products, async () => {
    await db.products.where('categoryId').equals(id).modify({ categoryId: '' });
    await db.categories.delete(id);
  });
}
