import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProductPage } from './features/products/ProductPage';
import { TransactionPage } from './features/transactions/TransactionPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { Route, Routes } from 'react-router-dom';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/transactions" element={<TransactionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}
