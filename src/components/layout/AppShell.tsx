import { useLocation, NavLink } from 'react-router-dom';
import { BarChart3, Boxes, Package2, Settings, ArrowLeftRight } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/products', label: 'Produk', icon: Package2 },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/settings', label: 'Pengaturan', icon: Settings }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <span>Stockita</span>
        </div>

        <nav className="nav-stack">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="searchbox">
            <span>Cari produk, SKU, atau menu…</span>
          </div>
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
