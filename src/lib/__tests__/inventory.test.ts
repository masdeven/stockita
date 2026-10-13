import { describe, it, expect } from 'vitest';
import { getInventoryStatus, calculateInventoryValue, calculateTransactionValue, normalizeSku, isValidSku } from '../format';
import { parseCSVSafe } from '../export';
import { validateBackup } from '../../db/backup';
import type { Product, Transaction } from '../../types';

describe('Inventory Domain Rules (PRD Section 4 & 16.1)', () => {
  const baseProduct: Product = {
    id: 'p-1',
    sku: 'SKU-TEST',
    name: 'Produk Uji',
    unit: 'pcs',
    costPrice: 10000,
    sellPrice: 15000,
    stock: 5,
    minStock: 5,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  it('determines status correctly: Habis when stock <= 0', () => {
    expect(getInventoryStatus({ ...baseProduct, stock: 0, minStock: 5 }).status).toBe('Habis');
    expect(getInventoryStatus({ ...baseProduct, stock: -1, minStock: 0 }).status).toBe('Habis');
  });

  it('determines status correctly: Rendah when stock > 0 && stock <= minStock', () => {
    expect(getInventoryStatus({ ...baseProduct, stock: 5, minStock: 5 }).status).toBe('Rendah');
    expect(getInventoryStatus({ ...baseProduct, stock: 1, minStock: 5 }).status).toBe('Rendah');
  });

  it('determines status correctly: Normal when stock > minStock', () => {
    expect(getInventoryStatus({ ...baseProduct, stock: 6, minStock: 5 }).status).toBe('Normal');
  });

  it('calculates total inventory value based on current cost price and positive stock', () => {
    const products: Product[] = [
      { ...baseProduct, id: '1', stock: 10, costPrice: 5000 },
      { ...baseProduct, id: '2', stock: 0, costPrice: 20000 },
      { ...baseProduct, id: '3', stock: 2, costPrice: 15000 }
    ];
    // 10 * 5000 + 0 + 2 * 15000 = 50000 + 30000 = 80000
    expect(calculateInventoryValue(products)).toBe(80000);
  });

  it('calculates transaction value correctly', () => {
    const txn: Transaction = {
      id: 'tx-1',
      type: 'in',
      productId: 'p-1',
      productSkuSnapshot: 'SKU-TEST',
      productNameSnapshot: 'Produk Uji',
      qty: 4,
      stockBefore: 2,
      stockAfter: 6,
      price: 12000,
      date: Date.now(),
      createdAt: Date.now()
    };
    expect(calculateTransactionValue(txn)).toBe(48000);
  });

  it('normalizes SKU case-insensitively and checks validity', () => {
    expect(normalizeSku('  Sku-123  ')).toBe('sku-123');
    expect(isValidSku(' SKU-1 ')).toBe(true);
    expect(isValidSku('   ')).toBe(false);
  });

  it('neutralizes formula injection in CSV export', () => {
    const unsafeData = [
      ['Name', 'FormulaCell'],
      ['Test', '=1+1'],
      ['Attack', '+cmd'],
      ['Minus', '-alert(1)'],
      ['At', '@SUM(A1:A10)']
    ];
    const csv = parseCSVSafe(unsafeData);
    // Cells starting with =, +, -, @ must be prefixed with a single quote '
    expect(csv).toContain("\"'=1+1\"");
    expect(csv).toContain("\"'+cmd\"");
    expect(csv).toContain("\"'-alert(1)\"");
    expect(csv).toContain("\"'@SUM(A1:A10)\"");
  });

  it('validates backup JSON structure correctly', () => {
    const validPayload = {
      app: 'Stockita',
      backupVersion: 1,
      schemaVersion: 1,
      exportedAt: Date.now(),
      products: [baseProduct],
      transactions: [],
      categories: [],
      suppliers: []
    };
    expect(validateBackup(validPayload).valid).toBe(true);

    const wrongAppPayload = { ...validPayload, app: 'OtherApp' };
    expect(validateBackup(wrongAppPayload).valid).toBe(false);

    const duplicateSkuPayload = {
      ...validPayload,
      products: [
        baseProduct,
        { ...baseProduct, id: 'p-2', sku: 'sku-test' } // duplicate case-folded
      ]
    };
    expect(validateBackup(duplicateSkuPayload).valid).toBe(false);
  });
});
