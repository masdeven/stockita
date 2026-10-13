import { db } from './database';
import type { Transaction } from '../types';

export async function exportBackup(): Promise<string> {
  const products = await db.products.toArray();
  const categories = await db.categories.toArray();
  const suppliers = await db.suppliers.toArray();
  const transactions = await db.transactions.toArray();
  const settings = (await db.settings.toArray())[0] ?? null;

  const payload = {
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

export async function importBackup(json: any): Promise<{ ok: boolean; reason?: string }>
{
  // basic validation
  if (!json || json.app !== 'Stockita') return { ok: false, reason: 'Invalid backup app' };
  if (typeof json.backupVersion !== 'number') return { ok: false, reason: 'Missing backupVersion' };
  if (!Array.isArray(json.products) || !Array.isArray(json.transactions)) return { ok: false, reason: 'Invalid structure' };

  // Replace all strategy — perform within transaction
  try {
    await db.transaction('rw', db.products, db.categories, db.suppliers, db.transactions, db.settings, async () => {
      await db.products.clear();
      await db.categories.clear();
      await db.suppliers.clear();
      await db.transactions.clear();
      await db.settings.clear();

      if (Array.isArray(json.products)) await db.products.bulkAdd(json.products);
      if (Array.isArray(json.categories)) await db.categories.bulkAdd(json.categories);
      if (Array.isArray(json.suppliers)) await db.suppliers.bulkAdd(json.suppliers);
      if (Array.isArray(json.transactions)) await db.transactions.bulkAdd(json.transactions);
      if (json.settings) await db.settings.put(json.settings);
    });

    return { ok: true };
  } catch (err: any) {
    return { ok: false, reason: (err && err.message) || 'Import failed' };
  }
}
