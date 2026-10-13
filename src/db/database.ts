import Dexie, { type Table } from 'dexie';
import type { AppSettings, Category, Product, Supplier, Transaction } from '../types';

class StockitaDatabase extends Dexie {
  products!: Table<Product, string>;
  categories!: Table<Category, string>;
  suppliers!: Table<Supplier, string>;
  transactions!: Table<Transaction, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('stockita-db');

    this.version(1).stores({
      products: '&id, sku, name, categoryId, supplierId, updatedAt',
      categories: '&id, name, updatedAt',
      suppliers: '&id, name, updatedAt',
      transactions: '&id, date, type, createdAt, productId',
      settings: '&currency, updatedAt'
    });
  }
}

export const db = new StockitaDatabase();

export const seedProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'SKU-001',
    name: 'Laptop Mini',
    categoryId: 'cat-1',
    supplierId: 'sup-1',
    unit: 'pcs',
    costPrice: 8200000,
    sellPrice: 9500000,
    stock: 12,
    minStock: 3,
    location: 'Rak A1',
    note: 'Laptop dasar untuk operasional',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    updatedAt: Date.now() - 1000 * 60 * 60 * 6
  },
  {
    id: 'prod-2',
    sku: 'SKU-002',
    name: 'Monitor 24"',
    categoryId: 'cat-2',
    supplierId: 'sup-2',
    unit: 'pcs',
    costPrice: 2100000,
    sellPrice: 2600000,
    stock: 2,
    minStock: 2,
    location: 'Rak B2',
    note: 'Monitor kerja',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 13,
    updatedAt: Date.now() - 1000 * 60 * 60 * 4
  }
];

export const seedCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Elektronik',
    description: 'Barang elektronik',
    color: 'accent',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: 'cat-2',
    name: 'Perangkat Kantor',
    description: 'Perangkat kerja',
    color: 'positive',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 4
  }
];

export const seedSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'PT Teknologi Maju',
    contact: '0812-0001',
    address: 'Jakarta',
    note: 'Supplier utama',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 7
  },
  {
    id: 'sup-2',
    name: 'CV Visualindo',
    contact: '0812-0002',
    address: 'Bandung',
    note: 'Perangkat display',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1
  }
];

export const seedTransactions: Transaction[] = [
  {
    id: 'txn-1',
    type: 'in',
    productId: 'prod-1',
    productSkuSnapshot: 'SKU-001',
    productNameSnapshot: 'Laptop Mini',
    qty: 10,
    stockBefore: 2,
    stockAfter: 12,
    price: 8200000,
    supplierId: 'sup-1',
    supplierNameSnapshot: 'PT Teknologi Maju',
    reason: 'opening-stock',
    date: Date.now() - 1000 * 60 * 60 * 24 * 2,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: 'txn-2',
    type: 'out',
    productId: 'prod-2',
    productSkuSnapshot: 'SKU-002',
    productNameSnapshot: 'Monitor 24"',
    qty: 3,
    stockBefore: 5,
    stockAfter: 2,
    price: 2600000,
    supplierId: 'sup-2',
    supplierNameSnapshot: 'CV Visualindo',
    reason: 'sale',
    date: Date.now() - 1000 * 60 * 60 * 24 * 1,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1
  }
];

export const defaultSettings: AppSettings = {
  currency: 'IDR',
  theme: 'light',
  lowStockThreshold: 3,
  dateFormat: 'locale',
  updatedAt: Date.now()
};
