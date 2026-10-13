import { create } from 'zustand';
import { db, defaultSettings, seedCategories, seedProducts, seedSuppliers, seedTransactions } from '../db/database';
import type { AppSettings, Category, Product, Supplier, Transaction } from '../types';
import { createProduct, updateProduct as repoUpdateProduct } from '../db/repositories/products';
import { createTransactionAtomically } from '../db/repositories/transactions';

export type StockState = {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  transactions: Transaction[];
  settings: AppSettings;
  loading: boolean;
  initialize: () => Promise<void>;
  addProduct: (product: Product, openingQty?: number) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  setTheme: (theme: AppSettings['theme']) => void;
  setSettings: (updater: Partial<AppSettings>) => void;
};

export const useStockitaStore = create<StockState>((set, get) => ({
  products: [],
  categories: [],
  suppliers: [],
  transactions: [],
  settings: defaultSettings,
  loading: true,
  initialize: async () => {
    try {
      const [products, categories, suppliers, transactions, settings] = await Promise.all([
        db.products.toArray(),
        db.categories.toArray(),
        db.suppliers.toArray(),
        db.transactions.orderBy('date').reverse().toArray(),
        db.settings.toArray()
      ]);

      const nextProducts = products.length ? products : seedProducts;
      const nextCategories = categories.length ? categories : seedCategories;
      const nextSuppliers = suppliers.length ? suppliers : seedSuppliers;
      const nextTransactions = transactions.length ? transactions : seedTransactions;
      const nextSettings = settings.length ? settings[0] : defaultSettings;

      set({
        products: nextProducts,
        categories: nextCategories,
        suppliers: nextSuppliers,
        transactions: nextTransactions,
        settings: nextSettings,
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
    // create product and optional opening-stock transaction atomically
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

      // refresh state from DB slice rather than optimistic append to ensure consistency
      const [products, transactions] = await Promise.all([db.products.toArray(), db.transactions.orderBy('date').reverse().toArray()]);
      set({ products, transactions });
    } catch (err) {
      console.error('Failed to add product', err);
      throw err;
    }
  },
  addTransaction: async (transaction) => {
    try {
      await createTransactionAtomically(transaction);
      // refresh affected data
      const [products, transactions] = await Promise.all([db.products.toArray(), db.transactions.orderBy('date').reverse().toArray()]);
      set({ products, transactions });
    } catch (err) {
      console.error('Failed to add transaction', err);
      throw err;
    }
  },
  setTheme: (theme) => {
    set((state) => ({ settings: { ...state.settings, theme, updatedAt: Date.now() } }));
    db.settings.put({ ...get().settings, theme, updatedAt: Date.now() });
  },
  setSettings: (updater) => {
    set((state) => ({ settings: { ...state.settings, ...updater, updatedAt: Date.now() } }));
    db.settings.put({ ...get().settings, ...updater, updatedAt: Date.now() });
  }
}));
