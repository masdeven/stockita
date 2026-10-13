import { db } from '../database';
import type { Supplier } from '../../types';

export async function createSupplier(supplier: Supplier) {
  await db.suppliers.put(supplier);
}

export async function updateSupplier(supplier: Supplier) {
  await db.suppliers.put(supplier);
}

export async function deleteSupplier(id: string) {
  // Before deleting, clear supplierId in products that reference it
  return db.transaction('rw', db.suppliers, db.products, async () => {
    await db.products.where('supplierId').equals(id).modify({ supplierId: '' });
    await db.suppliers.delete(id);
  });
}
