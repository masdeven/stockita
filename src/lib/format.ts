import { InventoryStatus, Product, Transaction } from '../types';

export const priceFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
});

export const numberFormatter = new Intl.NumberFormat('id-ID');

export function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return priceFormatter.format(value);
}

export function formatNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return numberFormatter.format(value);
}

export function getInventoryStatus(product: Product): InventoryStatus {
  const minStock = Number(product.minStock ?? 0);
  const stock = Number(product.stock ?? 0);

  if (stock <= 0) {
    return { status: 'Habis', stock, minStock };
  }

  if (stock <= minStock) {
    return { status: 'Rendah', stock, minStock };
  }

  return { status: 'Normal', stock, minStock };
}

export function calculateInventoryValue(products: Product[]) {
  return products.reduce((sum, product) => {
    if (product.stock > 0) {
      return sum + product.stock * product.costPrice;
    }
    return sum;
  }, 0);
}

export function calculateTransactionValue(transaction: Transaction) {
  if (transaction.price == null || Number.isNaN(transaction.price)) {
    return null;
  }

  return Math.abs(transaction.qty) * transaction.price;
}

export function normalizeSku(value: string) {
  return value.trim().toLowerCase();
}

export function isValidSku(value: string) {
  return normalizeSku(value).length > 0 && value.trim().length <= 64;
}
