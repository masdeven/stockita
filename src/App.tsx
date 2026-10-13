import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { CategoryPage } from './features/categories/CategoryPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProductPage } from './features/products/ProductPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { SupplierPage } from './features/suppliers/SupplierPage';
import { TransactionPage } from './features/transactions/TransactionPage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/suppliers" element={<SupplierPage />} />
        <Route path="/transactions" element={<TransactionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}
