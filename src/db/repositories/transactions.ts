import { db } from '../database';
import type { Transaction } from '../../types';

export async function createTransactionAtomically(tx: Transaction) {
  // Update product stock and add transaction in single IndexedDB transaction
  return db.transaction('rw', db.products, db.transactions, async () => {
    const product = await db.products.get(tx.productId);
    if (!product) throw new Error('Produk tidak ditemukan');

    // Validate resulting stock
    if (tx.type === 'out') {
      if (tx.qty > product.stock) throw new Error('Stok tidak cukup');
    }

    // compute new stock
    const newStock = tx.stockAfter;

    // persist transaction
    await db.transactions.put(tx);

    // update product stock and updatedAt
    await db.products.update(product.id, { stock: newStock, updatedAt: Date.now() });
  });
}
