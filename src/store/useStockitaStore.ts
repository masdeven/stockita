import { create } from 'zustand';
import { db, defaultSettings, seedCategories, seedProducts, seedSuppliers, seedTransactions } from '../db/database';
import type { AppSettings, Category, CustomDateRange, Period, Product, Supplier, ToastItem, Transaction } from '../types';
import { createProduct, updateProduct as repoUpdateProduct, deleteProduct as repoDeleteProduct } from '../db/repositories/products';
import { createTransactionAtomically } from '../db/repositories/transactions';
import { createCategory, updateCategory as repoUpdateCategory, deleteCategory as repoDeleteCategory } from '../db/repositories/categories';
import { createSupplier, updateSupplier as repoUpdateSupplier, deleteSupplier as repoDeleteSupplier } from '../db/repositories/suppliers';
import { broadcastUpdate } from '../lib/sync';
import { applyTheme } from '../lib/theme';

export type StockState = {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  transactions: Transaction[];
  settings: AppSettings;
  loading: boolean;
  activePeriod: Period;
  customDateRange: CustomDateRange | null;
  dateRangeModalOpen: boolean;
  toasts: ToastItem[];
  commandPaletteOpen: boolean;
  selectedProductId: string | null;
  selectedTransactionId: string | null;

  initialize: () => Promise<void>;
  addProduct: (product: Product, openingQty?: number) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSupplier: (supplier: Supplier) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  setTheme: (theme: AppSettings['theme']) => void;
  setSettings: (updater: Partial<AppSettings>) => void;
  setActivePeriod: (period: Period) => void;
  setCustomDateRange: (range: CustomDateRange | null) => void;
  setDateRangeModalOpen: (open: boolean) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSelectedProductId: (id: string | null) => void;
  setSelectedTransactionId: (id: string | null) => void;
  resetAllData: () => Promise<void>;
};

export const useStockitaStore = create<StockState>((set, get) => ({
  products: [],
  categories: [],
  suppliers: [],
  transactions: [],
  settings: defaultSettings,
  loading: true,
  activePeriod: '7H',
  customDateRange: null,
  dateRangeModalOpen: false,
  toasts: [],
  commandPaletteOpen: false,
  selectedProductId: null,
  selectedTransactionId: null,

  initialize: async () => {
    try {
      const [products, categories, suppliers, transactions, settingsList] = await Promise.all([
        db.products.toArray(),
        db.categories.toArray(),
        db.suppliers.toArray(),
        db.transactions.orderBy('date').reverse().toArray(),
        db.settings.toArray()
      ]);

      let activeSettings = settingsList[0];
      if (!activeSettings) {
        activeSettings = defaultSettings;
        await db.settings.put(defaultSettings);
      }

      // Seed only if completely empty database on first install
      let currentProducts = products;
      let currentCategories = categories;
      let currentSuppliers = suppliers;
      let currentTransactions = transactions;

      const isFirstLaunch = !localStorage.getItem('stockita_initialized');
      if (isFirstLaunch && products.length === 0 && categories.length === 0 && suppliers.length === 0) {
        localStorage.setItem('stockita_initialized', 'true');
        await db.transaction('rw', db.products, db.categories, db.suppliers, db.transactions, async () => {
          await db.categories.bulkAdd(seedCategories);
          await db.suppliers.bulkAdd(seedSuppliers);
          await db.products.bulkAdd(seedProducts);
          await db.transactions.bulkAdd(seedTransactions);
        });
        currentProducts = await db.products.toArray();
        currentCategories = await db.categories.toArray();
        currentSuppliers = await db.suppliers.toArray();
        currentTransactions = await db.transactions.orderBy('date').reverse().toArray();
      }

      applyTheme(activeSettings.theme);

      set({
        products: currentProducts,
        categories: currentCategories,
        suppliers: currentSuppliers,
        transactions: currentTransactions,
        settings: activeSettings,
        loading: false
      });
    } catch (error) {
      console.error('Failed to initialize Stockita', error);
      set({
        products: seedProducts,
        categories: seedCategories,
        suppliers: seedSuppliers,
        transactions: seedTransactions,
        settings: defaultSettings,
        loading: false
      });
    }
  },

  addProduct: async (product, openingQty = 0) => {
    try {
      await db.transaction('rw', db.products, db.transactions, async () => {
        await createProduct(product);
        if (openingQty && openingQty > 0) {
          const txn: Transaction = {
            id: crypto.randomUUID(),
            type: 'in',
            productId: product.id,
            productSkuSnapshot: product.sku,
            productNameSnapshot: product.name,
            qty: openingQty,
            stockBefore: 0,
            stockAfter: openingQty,
            price: product.costPrice || undefined,
            reason: 'opening-stock',
            date: Date.now(),
            createdAt: Date.now()
          };
          await db.transactions.put(txn);
        }
      });

      const [products, transactions] = await Promise.all([
        db.products.toArray(),
        db.transactions.orderBy('date').reverse().toArray()
      ]);
      set({ products, transactions });
      broadcastUpdate({ type: 'invalidate' });
      get().addToast(`Produk "${product.name}" berhasil ditambahkan`, 'success');
    } catch (err: any) {
      console.error('Failed to add product', err);
      get().addToast(err?.message || 'Gagal menambahkan produk', 'error');
      throw err;
    }
  },

  updateProduct: async (product) => {
    try {
      await repoUpdateProduct(product);
      const products = await db.products.toArray();
      set({ products });
      broadcastUpdate({ type: 'invalidate' });
      get().addToast(`Produk "${product.name}" berhasil diperbarui`, 'success');
    } catch (err: any) {
      console.error('Failed to update product', err);
      get().addToast(err?.message || 'Gagal memperbarui produk', 'error');
      throw err;
    }
  },

  deleteProduct: async (id) => {
    try {
      const prod = get().products.find((p) => p.id === id);
      await repoDeleteProduct(id);
      const products = await db.products.toArray();
      set({ products, selectedProductId: null });
      broadcastUpdate({ type: 'invalidate' });
      get().addToast(`Produk "${prod?.name ?? id}" berhasil dihapus`, 'info');
    } catch (err: any) {
      console.error('Failed to delete product', err);
      get().addToast(err?.message || 'Gagal menghapus produk', 'error');
      throw err;
    }
  },

  addCategory: async (category) => {
    try {
      await createCategory(category);
      const categories = await db.categories.toArray();
      set({ categories });
      broadcastUpdate({ type: 'invalidate' });
      get().addToast(`Kategori "${category.name}" berhasil ditambahkan`, 'success');
    } catch (err: any) {
      get().addToast(err?.message || 'Gagal menambahkan kategori', 'error');
      throw err;
    }
  },

  updateCategory: async (category) => {
    try {
      await repoUpdateCategory(category);
      const categories = await db.categories.toArray();
      set({ categories });
      broadcastUpdate({ type: 'invalidate' });
      get().addToast(`Kategori "${category.name}" berhasil diperbarui`, 'success');
    } catch (err: any) {
      get().addToast(err?.message || 'Gagal memperbarui kategori', 'error');
      throw err;
    }
  },

  deleteCategory: async (id) => {
    try {
      await repoDeleteCategory(id);
      const [categories, products] = await Promise.all([
        db.categories.toArray(),
        db.products.toArray()
      ]);
      set({ categories, products });
      broadcastUpdate({ type: 'invalidate' });
      get().addToast('Kategori berhasil dihapus', 'info');
    } catch (err: any) {
      get().addToast(err?.message || 'Gagal menghapus kategori', 'error');
      throw err;
    }
  },

  addSupplier: async (supplier) => {
    try {
      await createSupplier(supplier);
      const suppliers = await db.suppliers.toArray();
      set({ suppliers });
      broadcastUpdate({ type: 'invalidate' });
      get().addToast(`Supplier "${supplier.name}" berhasil ditambahkan`, 'success');
    } catch (err: any) {
      get().addToast(err?.message || 'Gagal menambahkan supplier', 'error');
      throw err;
    }
  },

  updateSupplier: async (supplier) => {
    try {
      await repoUpdateSupplier(supplier);
      const suppliers = await db.suppliers.toArray();
      set({ suppliers });
      broadcastUpdate({ type: 'invalidate' });
      get().addToast(`Supplier "${supplier.name}" berhasil diperbarui`, 'success');
    } catch (err: any) {
      get().addToast(err?.message || 'Gagal memperbarui supplier', 'error');
      throw err;
    }
  },

  deleteSupplier: async (id) => {
    try {
      await repoDeleteSupplier(id);
      const [suppliers, products] = await Promise.all([
        db.suppliers.toArray(),
        db.products.toArray()
      ]);
      set({ suppliers, products });
      broadcastUpdate({ type: 'invalidate' });
      get().addToast('Supplier berhasil dihapus', 'info');
    } catch (err: any) {
      get().addToast(err?.message || 'Gagal menghapus supplier', 'error');
      throw err;
    }
  },

  addTransaction: async (transaction) => {
    try {
      await createTransactionAtomically(transaction);
      const [products, transactions] = await Promise.all([
        db.products.toArray(),
        db.transactions.orderBy('date').reverse().toArray()
      ]);
      set({ products, transactions });
      broadcastUpdate({ type: 'invalidate' });
      get().addToast('Transaksi berhasil disimpan', 'success');
    } catch (err: any) {
      console.error('Failed to add transaction', err);
      get().addToast(err?.message || 'Gagal menyimpan transaksi', 'error');
      throw err;
    }
  },

  setTheme: (theme) => {
    applyTheme(theme);
    const updated = { ...get().settings, theme, updatedAt: Date.now() };
    set({ settings: updated });
    db.settings.put(updated);
  },

  setSettings: (updater) => {
    const updated = { ...get().settings, ...updater, updatedAt: Date.now() };
    if (updater.theme) {
      applyTheme(updater.theme);
    }
    set({ settings: updated });
    db.settings.put(updated);
    broadcastUpdate({ type: 'invalidate' });
    get().addToast('Pengaturan berhasil disimpan', 'success');
  },

  setActivePeriod: (period) => {
    set({ activePeriod: period, customDateRange: null });
  },

  setCustomDateRange: (range) => {
    set({ customDateRange: range });
  },

  setDateRangeModalOpen: (open) => {
    set({ dateRangeModalOpen: open });
  },

  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    const item: ToastItem = { id, type, message };
    set((state) => ({ toasts: [...state.toasts, item] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  setCommandPaletteOpen: (open) => {
    set({ commandPaletteOpen: open });
  },

  setSelectedProductId: (id) => {
    set({ selectedProductId: id });
  },

  setSelectedTransactionId: (id) => {
    set({ selectedTransactionId: id });
  },

  resetAllData: async () => {
    try {
      await db.transaction('rw', db.products, db.categories, db.suppliers, db.transactions, db.settings, async () => {
        await db.products.clear();
        await db.categories.clear();
        await db.suppliers.clear();
        await db.transactions.clear();
        // preserve theme and dateFormat preferences per PRD 8.10
        const currentTheme = get().settings.theme;
        const currentDateFormat = get().settings.dateFormat;
        const resetSettings: AppSettings = {
          ...defaultSettings,
          theme: currentTheme,
          dateFormat: currentDateFormat,
          updatedAt: Date.now()
        };
        await db.settings.clear();
        await db.settings.put(resetSettings);
      });

      localStorage.removeItem('stockita_initialized');
      set({
        products: [],
        categories: [],
        suppliers: [],
        transactions: [],
        selectedProductId: null,
        selectedTransactionId: null
      });
      broadcastUpdate({ type: 'invalidate' });
      get().addToast('Seluruh data inventori telah direset', 'info');
    } catch (err: any) {
      get().addToast(err?.message || 'Gagal mereset data', 'error');
      throw err;
    }
  }
}));
