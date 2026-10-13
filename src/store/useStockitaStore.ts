import { create } from 'zustand';
import { db, defaultSettings, seedCategories, seedProducts, seedSuppliers, seedTransactions } from '../db/database';
import type { AppSettings, Category, Product, Supplier, Transaction } from '../types';

export type StockState = {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  transactions: Transaction[];
  settings: AppSettings;
  loading: boolean;
  initialize: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
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
  addProduct: async (product) => {
    await db.products.put(product);
    set((state) => ({ products: [...state.products.filter((item) => item.id !== product.id), product] }));
  },
  addTransaction: async (transaction) => {
    await db.transactions.put(transaction);
    set((state) => ({ transactions: [transaction, ...state.transactions.filter((item) => item.id !== transaction.id)] }));
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
