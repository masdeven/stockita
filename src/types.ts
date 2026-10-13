export type TransactionType = 'in' | 'out' | 'adjust';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId?: string;
  supplierId?: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  location?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: 'accent' | 'positive' | 'negative' | 'warning' | 'subtle';
  createdAt: number;
  updatedAt: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  address?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  productId: string;
  productSkuSnapshot: string;
  productNameSnapshot: string;
  qty: number;
  stockBefore: number;
  stockAfter: number;
  price?: number;
  supplierId?: string;
  supplierNameSnapshot?: string;
  reason?: 'sale' | 'damaged' | 'lost' | 'transfer' | 'other' | 'opening-stock' | 'stocktake';
  note?: string;
  date: number;
  createdAt: number;
}

export interface AppSettings {
  currency: string;
  dateFormat: 'locale' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  lowStockThreshold: number;
  theme: ThemeMode;
  updatedAt: number;
}

export interface InventoryStatus {
  status: 'Habis' | 'Rendah' | 'Normal';
  stock: number;
  minStock: number;
}
