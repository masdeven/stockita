import { create } from 'zustand';
import { db, defaultSettings, seedCategories, seedProducts, seedSuppliers, seedTransactions } from '../db/database';
import { calculateInventoryValue, formatCurrency, getInventoryStatus } from '../lib/format';
import { AppSettings, Category, Product, Supplier, Transaction } from '../types';

type StoreState = {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  transactions: Transaction[];
  settings: AppSettings;
  addProduct: (product: Product) => void;
  addTransaction: (transaction: Transaction) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  setTheme: (theme: AppSettings['theme']) => void;
  initialize: () => void;
};

const initialProducts = [...seedProducts];
const initialCategories = [...seedCategories];
const initialSuppliers = [...seedSuppliers];
const initialTransactions = [...seedTransactions];

export const useStockitaStore = create<StoreState>((set, get) => ({
  products: initialProducts,
  categories: initialCategories,
  suppliers: initialSuppliers,
  transactions: initialTransactions,
  settings: defaultSettings,
  initialize: () => {
    const current = get();
    set({
      products: current.products.length ? current.products : initialProducts,
      categories: current.categories.length ? current.categories : initialCategories,
      suppliers: current.suppliers.length ? current.suppliers : initialSuppliers,
      transactions: current.transactions.length ? current.transactions : initialTransactions,
      settings: current.settings ?? defaultSettings
    });
  },
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  addTransaction: (transaction) => set((state) => ({ transactions: [transaction, ...state.transactions] })),
  updateProduct: (product) => set((state) => ({ products: state.products.map((item) => item.id === product.id ? product : item) })),
  deleteProduct: (id) => set((state) => ({ products: state.products.filter((product) => product.id !== id) })),
  setTheme: (theme) => set((state) => ({ settings: { ...state.settings, theme, updatedAt: Date.now() } }))
}));

export function useStockitaMetrics() {
  const products = useStockitaStore((state) => state.products);
  const transactions = useStockitaStore((state) => state.transactions);

  const productCount = products.length;
  const inventoryValue = calculateInventoryValue(products);
  const lowStockCount = products.filter((product) => getInventoryStatus(product).status === 'Rendah').length;
  const emptyStockCount = products.filter((product) => getInventoryStatus(product).status === 'Habis').length;

  const today = new Date();
  const todayTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date.toDateString() === today.toDateString();
  }).length;

  return {
    productCount,
    inventoryValue,
    lowStockCount,
    emptyStockCount,
    todayTransactions,
    stockValueText: formatCurrency(inventoryValue)
  };
}

export function useStockitaData() {
  return {
    products: useStockitaStore((state) => state.products),
    transactions: useStockitaStore((state) => state.transactions),
    categories: useStockitaStore((state) => state.categories),
    suppliers: useStockitaStore((state) => state.suppliers),
    settings: useStockitaStore((state) => state.settings)
  };
}
