import type { Product, Transaction } from '../types';

export function computeStockAfter(product: Product, type: Transaction['type'], qty: number, physicalStock?: number) {
  if (type === 'in') return product.stock + qty;
  if (type === 'out') return product.stock - qty;
  if (type === 'adjust') return typeof physicalStock === 'number' ? physicalStock : product.stock;
  return product.stock;
}

export function transactionQtyForType(type: Transaction['type'], qty: number, physicalStock?: number, productStock?: number) {
  if (type === 'in') return Math.abs(qty);
  if (type === 'out') return Math.abs(qty);
  if (type === 'adjust') {
    if (typeof physicalStock !== 'number' || typeof productStock !== 'number') return 0;
    return physicalStock - productStock;
  }
  return qty;
}
