import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProductPage } from './features/products/ProductPage';
import { CategoriesPage } from './features/categories/CategoriesPage';
import { SuppliersPage } from './features/suppliers/SuppliersPage';
import { StockInPage } from './features/transactions/StockInPage';
import { StockOutPage } from './features/transactions/StockOutPage';
import { StockAdjustPage } from './features/transactions/StockAdjustPage';
import { TransactionHistoryPage } from './features/transactions/TransactionHistoryPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { Route, Routes } from 'react-router-dom';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/stock-in" element={<StockInPage />} />
        <Route path="/stock-out" element={<StockOutPage />} />
        <Route path="/stock-adjust" element={<StockAdjustPage />} />
        <Route path="/transactions" element={<TransactionHistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}
