import { db } from './database';
import type { AppSettings, Category, Product, Supplier, Transaction } from '../types';

export interface BackupPayload {
  app: string;
  backupVersion: number;
  schemaVersion: number;
  exportedAt: number;
  settings?: AppSettings | null;
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  transactions: Transaction[];
}

export interface BackupPreview {
  valid: boolean;
  reason?: string;
  counts?: {
    products: number;
    categories: number;
    suppliers: number;
    transactions: number;
  };
  payload?: BackupPayload;
}

export async function exportBackup(): Promise<string> {
  const products = await db.products.toArray();
  const categories = await db.categories.toArray();
  const suppliers = await db.suppliers.toArray();
  const transactions = await db.transactions.toArray();
  const settings = (await db.settings.toArray())[0] ?? null;

  const payload: BackupPayload = {
    app: 'Stockita',
    backupVersion: 1,
    schemaVersion: 1,
    exportedAt: Date.now(),
    settings,
    products,
    categories,
    suppliers,
    transactions
  };

  return JSON.stringify(payload, null, 2);
}

export function validateBackup(json: any): BackupPreview {
  if (!json || typeof json !== 'object') {
    return { valid: false, reason: 'File JSON tidak valid atau kosong' };
  }
  if (json.app !== 'Stockita') {
    return { valid: false, reason: 'File bukan backup resmi Stockita (app mismatch)' };
  }
  if (typeof json.backupVersion !== 'number') {
    return { valid: false, reason: 'Versi backup tidak ditemukan' };
  }
  if (!Array.isArray(json.products) || !Array.isArray(json.transactions)) {
    return { valid: false, reason: 'Struktur data produk atau transaksi tidak valid' };
  }

  // Validate duplicate SKU in backup products
  const skuSet = new Set<string>();
  for (const p of json.products) {
    if (!p.id || !p.sku || !p.name) {
      return { valid: false, reason: 'Terdapat produk dengan data wajib (ID/SKU/Nama) yang tidak lengkap' };
    }
    const norm = String(p.sku).trim().toLowerCase();
    if (skuSet.has(norm)) {
      return { valid: false, reason: `Ditemukan SKU duplikat dalam backup: ${p.sku}` };
    }
    skuSet.add(norm);
  }

  return {
    valid: true,
    counts: {
      products: json.products.length,
      categories: Array.isArray(json.categories) ? json.categories.length : 0,
      suppliers: Array.isArray(json.suppliers) ? json.suppliers.length : 0,
      transactions: json.transactions.length
    },
    payload: json as BackupPayload
  };
}

export async function importBackup(payload: BackupPayload): Promise<{ ok: boolean; reason?: string }> {
  try {
    await db.transaction('rw', db.products, db.categories, db.suppliers, db.transactions, db.settings, async () => {
      await db.products.clear();
      await db.categories.clear();
      await db.suppliers.clear();
      await db.transactions.clear();
      await db.settings.clear();

      if (Array.isArray(payload.products) && payload.products.length > 0) {
        await db.products.bulkAdd(payload.products);
      }
      if (Array.isArray(payload.categories) && payload.categories.length > 0) {
        await db.categories.bulkAdd(payload.categories);
      }
      if (Array.isArray(payload.suppliers) && payload.suppliers.length > 0) {
        await db.suppliers.bulkAdd(payload.suppliers);
      }
      if (Array.isArray(payload.transactions) && payload.transactions.length > 0) {
        await db.transactions.bulkAdd(payload.transactions);
      }
      if (payload.settings) {
        await db.settings.put(payload.settings);
      }
    });

    return { ok: true };
  } catch (err: any) {
    return { ok: false, reason: err?.message || 'Proses import data gagal' };
  }
}
