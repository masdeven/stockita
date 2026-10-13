import { Product } from '../types';
import { getInventoryStatus } from './format';

export function validateProduct(product: Partial<Product>) {
  const name = (product.name ?? '').trim();
  const sku = (product.sku ?? '').trim();
  const unit = (product.unit ?? 'pcs').trim();

  if (!name || name.length > 120) {
    return 'Nama produk wajib 1–120 karakter.';
  }

  if (!sku || sku.length > 64) {
    return 'SKU wajib 1–64 karakter.';
  }

  if (!unit || unit.length > 24) {
    return 'Satuan wajib 1–24 karakter.';
  }

  if (product.costPrice != null && (!Number.isFinite(product.costPrice) || product.costPrice < 0)) {
    return 'Harga beli tidak valid.';
  }

  if (product.sellPrice != null && (!Number.isFinite(product.sellPrice) || product.sellPrice < 0)) {
    return 'Harga jual tidak valid.';
  }

  if (product.stock != null && (!Number.isFinite(product.stock) || product.stock < 0)) {
    return 'Stok tidak valid.';
  }

  if (product.minStock != null && (!Number.isFinite(product.minStock) || product.minStock < 0)) {
    return 'Stok minimum tidak valid.';
  }

  return null;
}

export function validateTransactionInput(qty: number, productStock: number, type: 'in' | 'out' | 'adjust') {
  if (!Number.isFinite(qty) || qty <= 0) {
    return 'Kuantitas harus lebih dari 0.';
  }

  if (type === 'out' && qty > productStock) {
    return `Stok tersedia: ${productStock}`;
  }

  return null;
}

export function getStatusTone(status: ReturnType<typeof getInventoryStatus>['status']) {
  if (status === 'Habis') return 'negative';
  if (status === 'Rendah') return 'warning';
  return 'positive';
}
