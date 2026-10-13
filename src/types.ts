export type TransactionType = 'in' | 'out' | 'adjust';
export type ThemeMode = 'light' | 'dark' | 'system';
export type TokenColor = 'accent' | 'positive' | 'negative' | 'warning' | 'subtle';
export type Period = '7H' | '30H' | '90H';

export interface CustomDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface StoreProfile {
  storeName: string;
  logo?: string;
  address?: string;
  contact?: string;
}

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
  image?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: TokenColor;
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
  profile?: StoreProfile;
  currency: string;
  dateFormat: 'locale' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  lowStockThreshold: number;
  theme: ThemeMode;
  schemaVersion?: number;
  updatedAt: number;
}

export interface InventoryStatus {
  status: 'Habis' | 'Rendah' | 'Normal';
  stock: number;
  minStock: number;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
