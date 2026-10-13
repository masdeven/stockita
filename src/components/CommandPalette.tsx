import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockitaStore } from '../store/useStockitaStore';
import { formatCurrency } from '../lib/format';
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
  Plus
} from 'lucide-react';

interface PaletteItem {
  id: string;
  category: 'NAVIGASI' | 'PRODUK' | 'TRANSAKSI';
  title: string;
  subtitle?: string;
  badge?: string;
  action: () => void;
  icon?: any;
}

export function CommandPalette() {
  const isOpen = useStockitaStore((s) => s.commandPaletteOpen);
  const setIsOpen = useStockitaStore((s) => s.setCommandPaletteOpen);
  const products = useStockitaStore((s) => s.products);
  const transactions = useStockitaStore((s) => s.transactions);
  const setSelectedProductId = useStockitaStore((s) => s.setSelectedProductId);
  const setSelectedTransactionId = useStockitaStore((s) => s.setSelectedTransactionId);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Global key listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const navItems: PaletteItem[] = [
    {
      id: 'nav-dashboard',
      category: 'NAVIGASI',
      title: 'Dashboard',
      subtitle: 'Ringkasan performa dan stok',
      icon: BarChart3,
      action: () => { navigate('/'); setIsOpen(false); }
    },
    {
      id: 'nav-products',
      category: 'NAVIGASI',
      title: 'Master Produk',
      subtitle: 'Katalog barang dan stok',
      icon: Box,
      action: () => { navigate('/products'); setIsOpen(false); }
    },
    {
      id: 'nav-categories',
      category: 'NAVIGASI',
      title: 'Kategori',
      subtitle: 'Kelola kategori produk',
      icon: Tags,
      action: () => { navigate('/categories'); setIsOpen(false); }
    },
    {
      id: 'nav-suppliers',
      category: 'NAVIGASI',
      title: 'Supplier',
      subtitle: 'Daftar pemasok barang',
      icon: Truck,
      action: () => { navigate('/suppliers'); setIsOpen(false); }
    },
    {
      id: 'nav-stock-in',
      category: 'NAVIGASI',
      title: 'Stok Masuk',
      subtitle: 'Penerimaan barang baru / PO',
      icon: ArrowDownLeft,
      action: () => { navigate('/stock-in'); setIsOpen(false); }
    },
    {
      id: 'nav-stock-out',
      category: 'NAVIGASI',
      title: 'Stok Keluar',
      subtitle: 'Penjualan, rusak, atau pengeluaran',
      icon: ArrowUpRight,
      action: () => { navigate('/stock-out'); setIsOpen(false); }
    },
    {
      id: 'nav-stock-adjust',
      category: 'NAVIGASI',
      title: 'Penyesuaian / Stok Opname',
      subtitle: 'Sinkronisasi stok fisik dengan sistem',
      icon: SlidersHorizontal,
      action: () => { navigate('/stock-adjust'); setIsOpen(false); }
    },
    {
      id: 'nav-history',
      category: 'NAVIGASI',
      title: 'Riwayat Transaksi',
      subtitle: 'Catatan seluruh mutasi stok',
      icon: History,
      action: () => { navigate('/transactions'); setIsOpen(false); }
    },
    {
      id: 'nav-settings',
      category: 'NAVIGASI',
      title: 'Pengaturan & Backup',
      subtitle: 'Profil toko, tema, dan ekspor/impor',
      icon: Settings,
      action: () => { navigate('/settings'); setIsOpen(false); }
    }
  ];

  const q = query.trim().toLowerCase();

  const filteredNav = navItems.filter(
    (item) => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)
  );

  const matchedProducts: PaletteItem[] = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q))
    )
    .slice(0, 5)
    .map((p) => ({
      id: `prod-${p.id}`,
      category: 'PRODUK',
      title: p.name,
      subtitle: `SKU: ${p.sku} · Stok: ${p.stock} ${p.unit} · ${formatCurrency(p.costPrice)}`,
      badge: `${p.stock} ${p.unit}`,
      action: () => {
        navigate('/products');
        setSelectedProductId(p.id);
        setIsOpen(false);
      }
    }));

  const matchedTransactions: PaletteItem[] = transactions
    .filter(
      (t) =>
        t.productNameSnapshot.toLowerCase().includes(q) ||
        t.productSkuSnapshot.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        (t.reason && t.reason.toLowerCase().includes(q))
    )
    .slice(0, 5)
    .map((t) => ({
      id: `tx-${t.id}`,
      category: 'TRANSAKSI',
      title: `${t.type === 'in' ? '+' : t.type === 'out' ? '-' : ''}${Math.abs(t.qty)} · ${t.productNameSnapshot}`,
      subtitle: `${new Date(t.date).toLocaleDateString('id-ID')} · Tipe: ${t.type.toUpperCase()}${t.note ? ` · ${t.note}` : ''}`,
      badge: t.type === 'in' ? 'Masuk' : t.type === 'out' ? 'Keluar' : 'Opname',
      action: () => {
        navigate('/transactions');
        setSelectedTransactionId(t.id);
        setIsOpen(false);
      }
    }));

  const combinedItems: PaletteItem[] = [];
  if (q.length > 0) {
    if (matchedProducts.length > 0) combinedItems.push(...matchedProducts);
    if (matchedTransactions.length > 0) combinedItems.push(...matchedTransactions);
    if (filteredNav.length > 0) combinedItems.push(...filteredNav);
  } else {
    combinedItems.push(...filteredNav);
  }

  // Handle keyboard navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, combinedItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + combinedItems.length) % Math.max(1, combinedItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (combinedItems[selectedIndex]) {
        combinedItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key.toLowerCase() === 'n' && query === '') {
      // Shortcut 'N' opens new product form when input is empty
      e.preventDefault();
      navigate('/products?action=new');
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setIsOpen(false)} role="dialog" aria-modal="true">
      <div className="palette-card modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="palette-search-row">
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder="Ketik untuk mencari produk, transaksi, atau menu… (Tekan 'N' untuk produk baru)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button className="icon-button" onClick={() => setIsOpen(false)} aria-label="Tutup pencarian">
            ✕
          </button>
        </div>

        <div className="palette-results">
          {combinedItems.length === 0 ? (
            <div className="palette-empty">
              <span>Tidak ada hasil yang cocok dengan "{query}"</span>
              <button className="text-button" onClick={() => setQuery('')}>
                Bersihkan kata kunci
              </button>
            </div>
          ) : (
            <div>
              {/* Group by category */}
              {(['NAVIGASI', 'PRODUK', 'TRANSAKSI'] as const).map((cat) => {
                const groupItems = combinedItems.filter((i) => i.category === cat);
                if (groupItems.length === 0) return null;

                return (
                  <div key={cat} className="palette-group">
                    <div className="palette-group-header">{cat}</div>
                    {groupItems.map((item) => {
                      const overallIndex = combinedItems.indexOf(item);
                      const isSelected = overallIndex === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.id}
                          className={`palette-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => item.action()}
                          onMouseEnter={() => setSelectedIndex(overallIndex)}
                        >
                          <div className="palette-item-left">
                            {Icon ? (
                              <Icon size={16} className="palette-icon" />
                            ) : (
                              <div className="palette-dot" />
                            )}
                            <div>
                              <div className="palette-item-title">{item.title}</div>
                              {item.subtitle && (
                                <div className="palette-item-subtitle">{item.subtitle}</div>
                              )}
                            </div>
                          </div>
                          {item.badge && <span className="palette-badge">{item.badge}</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="palette-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> Pilih</span>
          <span><kbd>Enter</kbd> Jalankan</span>
          <span><kbd>Esc</kbd> Tutup</span>
          <span><kbd>N</kbd> Produk Baru</span>
        </div>
      </div>
    </div>
  );
}
