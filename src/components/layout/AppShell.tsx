import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStockitaStore } from '../../store/useStockitaStore';
import { exportBackup } from '../../db/backup';
import { saveAs } from '../../lib/saveAs';
import { CommandPalette } from '../CommandPalette';
import { ToastContainer } from '../ui/Toast';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import {
  BarChart3,
  Box,
  Tags,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  History,
  Settings,
  Trash2,
  Search,
  Sun,
  Moon,
  Download,
  Plus
} from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const theme = useStockitaStore((s) => s.settings.theme);
  const setTheme = useStockitaStore((s) => s.setTheme);
  const activePeriod = useStockitaStore((s) => s.activePeriod);
  const setActivePeriod = useStockitaStore((s) => s.setActivePeriod);
  const setCommandPaletteOpen = useStockitaStore((s) => s.setCommandPaletteOpen);
  const addToast = useStockitaStore((s) => s.addToast);
  const resetAllData = useStockitaStore((s) => s.resetAllData);
  const settings = useStockitaStore((s) => s.settings);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [mobileAddSheetOpen, setMobileAddSheetOpen] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const handleExportBackup = async () => {
    try {
      const json = await exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const filename = `stockita-backup-${new Date().toISOString().slice(0, 10)}.json`;
      saveAs(blob, filename);
      addToast('Backup berhasil diunduh', 'success');
    } catch (err: any) {
      addToast('Gagal membuat backup data', 'error');
    }
  };

  const desktopNavGroups = [
    {
      id: 'core',
      items: [
        { to: '/', label: 'Dashboard', icon: BarChart3 },
        { to: '/products', label: 'Master Produk', icon: Box },
        { to: '/categories', label: 'Kategori', icon: Tags },
        { to: '/suppliers', label: 'Supplier', icon: Truck }
      ]
    },
    {
      id: 'transactions',
      items: [
        { to: '/stock-in', label: 'Stok Masuk', icon: ArrowDownLeft },
        { to: '/stock-out', label: 'Stok Keluar', icon: ArrowUpRight },
        { to: '/stock-adjust', label: 'Penyesuaian Stok', icon: SlidersHorizontal },
        { to: '/transactions', label: 'Riwayat Transaksi', icon: History }
      ]
    }
  ];

  const lastUpdated = settings.updatedAt
    ? new Date(settings.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : 'Hari ini';

  return (
    <div className="app-shell-root">
      {/* 1. TOP BAR 40px */}
      <header className="topbar-shell">
        <div className="topbar-left">
          <div className="brand-logo" onClick={() => navigate('/')}>
            <div className="brand-badge">S</div>
            <span className="brand-title">Stockita</span>
          </div>
        </div>

        <div className="topbar-center">
          <button
            className="search-trigger"
            onClick={() => setCommandPaletteOpen(true)}
            aria-label="Cari produk, SKU, atau menu"
          >
            <Search size={16} className="search-icon" />
            <span className="search-placeholder">Cari produk, SKU, atau menu…</span>
            <span className="search-kbd">Ctrl+K</span>
          </button>
        </div>

        <div className="topbar-right">
          <button
            className="icon-button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            aria-label="Toggle tema"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="button cta cta-backup-btn"
            onClick={handleExportBackup}
            title="Download file cadangan JSON"
          >
            <Download size={14} />
            <span>Export Backup</span>
          </button>
        </div>
      </header>

      {/* 2. BODY SHELL: Left Toolbar 52px + Main Content */}
      <div className="shell-body">
        {/* Desktop Left Toolbar (52px wide) */}
        <aside className="sidebar-toolbar" aria-label="Navigasi Utama">
          <div className="toolbar-stack">
            {desktopNavGroups.map((group, gIdx) => (
              <div key={group.id} className="toolbar-group">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => `toolbar-item ${isActive ? 'active' : ''}`}
                    title={label}
                    aria-label={label}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                    <span className="tooltip">{label}</span>
                  </NavLink>
                ))}
                {gIdx < desktopNavGroups.length - 1 && <div className="toolbar-divider" />}
              </div>
            ))}
          </div>

          {/* Bottom section of left toolbar */}
          <div className="toolbar-bottom">
            <div className="toolbar-divider" />
            <NavLink
              to="/settings"
              className={({ isActive }) => `toolbar-item ${isActive ? 'active' : ''}`}
              title="Pengaturan"
              aria-label="Pengaturan"
            >
              <Settings size={20} strokeWidth={1.5} />
              <span className="tooltip">Pengaturan</span>
            </NavLink>
            <button
              className="toolbar-item toolbar-item-danger"
              onClick={() => setResetDialogOpen(true)}
              title="Reset Data"
              aria-label="Reset Data"
            >
              <Trash2 size={20} strokeWidth={1.5} />
              <span className="tooltip">Reset Data</span>
            </button>
          </div>
        </aside>

        {/* Work Area */}
        <main className="main-work-area">
          <div className="content-scroll-container">{children}</div>

          {/* 3. BOTTOM BAR 36px (Desktop) */}
          <footer className="bottombar-shell">
            <div className="bottombar-left">
              <div className="segmented-control" role="group" aria-label="Pilihan rentang waktu">
                {(['7H', '30H', '90H'] as const).map((period) => (
                  <button
                    key={period}
                    className={`segment-btn ${activePeriod === period ? 'active' : ''}`}
                    onClick={() => setActivePeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <span className="bottombar-chip">{settings.currency || 'IDR'}</span>
            </div>

            <div className="bottombar-right">
              <span className="bottombar-info">Data tersimpan di perangkat ini</span>
              <span className="bottombar-dot">•</span>
              <span className="bottombar-info">Diperbarui: {lastUpdated}</span>
            </div>
          </footer>
        </main>
      </div>

      {/* 4. MOBILE BOTTOM NAVIGATION (< 768px) */}
      <nav className="mobile-bottom-nav" aria-label="Navigasi Mobile">
        <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Box size={20} />
          <span>Produk</span>
        </NavLink>
        <button
          className="mobile-nav-item mobile-add-btn"
          onClick={() => setMobileAddSheetOpen(true)}
          aria-label="Tambah Transaksi atau Produk"
        >
          <div className="mobile-add-badge">
            <Plus size={20} />
          </div>
          <span>Tambah</span>
        </button>
        <NavLink to="/transactions" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <History size={20} />
          <span>Riwayat</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Setelan</span>
        </NavLink>
      </nav>

      {/* Mobile Add Action Sheet */}
      <Modal
        isOpen={mobileAddSheetOpen}
        onClose={() => setMobileAddSheetOpen(false)}
        title="Pilih Aksi Cepat"
        maxWidth="sm"
      >
        <div className="mobile-action-sheet-list">
          <button
            className="action-sheet-item"
            onClick={() => {
              navigate('/products?action=new');
              setMobileAddSheetOpen(false);
            }}
          >
            <Box size={18} />
            <div>
              <strong>Tambah Produk Baru</strong>
              <small>Daftarkan SKU dan barang baru ke master data</small>
            </div>
          </button>
          <button
            className="action-sheet-item"
            onClick={() => {
              navigate('/stock-in');
              setMobileAddSheetOpen(false);
            }}
          >
            <ArrowDownLeft size={18} />
            <div>
              <strong>Catat Stok Masuk</strong>
              <small>Penerimaan barang dari supplier atau pembelian</small>
            </div>
          </button>
          <button
            className="action-sheet-item"
            onClick={() => {
              navigate('/stock-out');
              setMobileAddSheetOpen(false);
            }}
          >
            <ArrowUpRight size={18} />
            <div>
              <strong>Catat Stok Keluar</strong>
              <small>Penjualan, barang rusak, atau pemakaian</small>
            </div>
          </button>
          <button
            className="action-sheet-item"
            onClick={() => {
              navigate('/stock-adjust');
              setMobileAddSheetOpen(false);
            }}
          >
            <SlidersHorizontal size={18} />
            <div>
              <strong>Penyesuaian / Stok Opname</strong>
              <small>Koreksi stok sistem dengan stok fisik nyata</small>
            </div>
          </button>
        </div>
      </Modal>

      {/* Global Overlays */}
      <CommandPalette />
      <ToastContainer />

      {/* Destructive Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={resetAllData}
        title="Reset Seluruh Data"
        message="PERINGATAN: Tindakan ini akan menghapus seluruh produk, transaksi, kategori, dan supplier secara permanen dari browser ini."
        confirmText="Hapus Semua Data"
        cancelText="Batal"
        isDestructive={true}
        requiredKeyword="HAPUS"
      />
    </div>
  );
}
