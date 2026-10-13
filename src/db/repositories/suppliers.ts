import { db } from '../database';
import type { Supplier } from '../../types';

export async function createSupplier(supplier: Supplier) {
  await db.suppliers.put(supplier);
}

export async function updateSupplier(supplier: Supplier) {
  await db.suppliers.put(supplier);
}

export async function deleteSupplier(id: string) {
  // Safe delete: unlinks supplier from any products referencing it
  await db.transaction('rw', db.suppliers, db.products, async () => {
    await db.products.where('supplierId').equals(id).modify({ supplierId: undefined });
    await db.suppliers.delete(id);
  });
}
