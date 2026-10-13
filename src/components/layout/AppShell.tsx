import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeftRight, BarChart3, Box, Package2, Settings, Truck } from 'lucide-react';

const items = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/products', label: 'Produk', icon: Box },
  { to: '/categories', label: 'Kategori', icon: Package2 },
  { to: '/suppliers', label: 'Supplier', icon: Truck },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/settings', label: 'Pengaturan', icon: Settings }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <span>Stockita</span>
        </div>

        <nav className="nav-stack">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="searchbox">Cari produk, SKU, atau menu…</div>
          <div className="topbar-actions">
            <button className="button secondary">Tema</button>
            <button className="button primary cta">Export Backup</button>
          </div>
        </header>
        <div className="content-wrap">{children}</div>
      </main>
    </div>
  );
}

export default AppShell;
