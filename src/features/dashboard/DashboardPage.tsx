import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockitaStore } from '../../store/useStockitaStore';
import { formatCurrency, formatDate, getInventoryStatus } from '../../lib/format';
import { Modal } from '../../components/ui/Modal';
import { ArrowDownLeft, ArrowUpRight, AlertTriangle, PackageX, ExternalLink, Box, Calendar, AlertCircle } from 'lucide-react';
import type { Transaction, Product } from '../../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const products = useStockitaStore((s) => s.products);
  const transactions = useStockitaStore((s) => s.transactions);
  const activePeriod = useStockitaStore((s) => s.activePeriod);
  const setActivePeriod = useStockitaStore((s) => s.setActivePeriod);
  const loading = useStockitaStore((s) => s.loading);

  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const chartScrollRef = useRef<HTMLDivElement>(null);
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [isCustomRange, setIsCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().slice(0, 10);
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dateError, setDateError] = useState<string | null>(null);

  const handleSelectPreset = (period: '7H' | '30H' | '90H') => {
    setIsCustomRange(false);
    setDateError(null);
    setActivePeriod(period);
  };

  const handleStartDateChange = (val: string) => {
    if (!val) return;
    if (customEndDate && val > customEndDate) {
      setDateError('Tanggal mulai tidak boleh melebihi tanggal akhir');
      return;
    }
    setDateError(null);
    setCustomStartDate(val);
    setIsCustomRange(true);
  };

  const handleEndDateChange = (val: string) => {
    if (!val) return;
    if (customStartDate && val < customStartDate) {
      setDateError('Tanggal akhir tidak boleh lebih awal dari tanggal mulai');
      return;
    }
    setDateError(null);
    setCustomEndDate(val);
    setIsCustomRange(true);
  };

  // 1. Metric calculations
  const productCount = products.length;
  const inventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.stock > 0 ? p.stock * p.costPrice : 0), 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => getInventoryStatus(p).status === 'Rendah');
  }, [products]);

  const emptyStockProducts = useMemo(() => {
    return products.filter((p) => getInventoryStatus(p).status === 'Habis');
  }, [products]);

  const todayTransactions = useMemo(() => {
    const today = new Date().toDateString();
    return transactions.filter((t) => new Date(t.date).toDateString() === today).length;
  }, [transactions]);

  // 2. Urgent list (sorted by Habis first, then low stock)
  const urgentList = useMemo(() => {
    const combined = [...emptyStockProducts, ...lowStockProducts];
    return combined.slice(0, 6);
  }, [emptyStockProducts, lowStockProducts]);

  // 3. Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => b.date - a.date || b.createdAt - a.createdAt).slice(0, 5);
  }, [transactions]);

  // 4. Chart data generation based on activePeriod or Custom Range
  const chartData = useMemo(() => {
    const days: { dateLabel: string; inQty: number; outQty: number; timestamp: number }[] = [];

    if (isCustomRange && customStartDate && customEndDate) {
      const start = new Date(customStartDate + 'T00:00:00');
      const end = new Date(customEndDate + 'T23:59:59');

      if (start > end) return [];

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const totalDays = Math.min(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 365);

      for (let i = 0; i < totalDays; i++) {
        const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = d.toDateString();
        const label = totalDays <= 7
          ? d.toLocaleDateString('id-ID', { weekday: 'short' })
          : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric' });

        let inQty = 0;
        let outQty = 0;

        for (const t of transactions) {
          if (new Date(t.date).toDateString() === dateStr) {
            if (t.type === 'in') inQty += t.qty;
            else if (t.type === 'out') outQty += Math.abs(t.qty);
          }
        }

        days.push({
          dateLabel: label,
          inQty,
          outQty,
          timestamp: d.getTime()
        });
      }
      return days;
    }

    const periodDays = activePeriod === '90H' ? 90 : activePeriod === '30H' ? 30 : 7;
    const now = new Date();

    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toDateString();
      const label = periodDays === 7 
        ? d.toLocaleDateString('id-ID', { weekday: 'short' })
        : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric' });

      let inQty = 0;
      let outQty = 0;

      for (const t of transactions) {
        if (new Date(t.date).toDateString() === dateStr) {
          if (t.type === 'in') inQty += t.qty;
          else if (t.type === 'out') outQty += Math.abs(t.qty);
        }
      }

      days.push({
        dateLabel: label,
        inQty,
        outQty,
        timestamp: d.getTime()
      });
    }
    return days;
  }, [transactions, activePeriod, isCustomRange, customStartDate, customEndDate]);

  const dayColClass = useMemo(() => {
    const len = chartData.length;
    if (len > 45) return 'chart-day-col chart-day-col-90';
    if (len > 10) return 'chart-day-col chart-day-col-30';
    return 'chart-day-col chart-day-col-7';
  }, [chartData.length]);

  const maxChartQty = useMemo(() => {
    const max = Math.max(...chartData.map((d) => Math.max(d.inQty, d.outQty)), 5);
    return max;
  }, [chartData]);

  useEffect(() => {
    if (chartScrollRef.current) {
      chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
    }
  }, [activePeriod, chartData, isCustomRange]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* BARIS 1: 4 Metrik Ringkas */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/products')}>
          <div className="stat-label">Total Produk</div>
          <div className="stat-value">{productCount}</div>
          <div className="stat-meta">Master data aktif terdaftar</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Nilai Estimasi Stok</div>
          <div className="stat-value">{formatCurrency(inventoryValue)}</div>
          <div className="stat-meta">Berdasarkan harga beli saat ini</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/products?status=low')}>
          <div className="stat-label">Stok Rendah & Habis</div>
          <div className="stat-value">
            {lowStockProducts.length} <span className="stat-sub">({emptyStockProducts.length} habis)</span>
          </div>
          <div className="stat-meta">Perlu pemesanan atau pengisian</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/transactions')}>
          <div className="stat-label">Transaksi Hari Ini</div>
          <div className="stat-value">{todayTransactions}</div>
          <div className="stat-meta">Mutasi tercatat tanggal lokal</div>
        </div>
      </div>

      {/* BARIS 2: Pergerakan Stok Chart + Alert Panel */}
      <div className="content-grid">
        {/* Chart Section */}
        <section className="panel panel-chart">
          <div className="section-header chart-section-header">
            <div>
              <div className="section-title">Pergerakan Stok (Masuk vs Keluar)</div>
              <div className="caption">Kuantitas harian unit barang masuk dan keluar</div>
            </div>

            <div className="chart-filter-controls">
              {/* Preset 7H, 30H, 90H */}
              <div className="segmented-control" role="group" aria-label="Preset rentang waktu">
                {(['7H', '30H', '90H'] as const).map((period) => (
                  <button
                    key={period}
                    className={`segment-btn ${!isCustomRange && activePeriod === period ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {/* Custom Date Range with Calendar Icon */}
              <div className={`custom-date-range-box ${isCustomRange ? 'active' : ''}`} title="Filter rentang tanggal kustom">
                <Calendar size={14} className="calendar-icon" />
                <div className="date-inputs-pair">
                  <input
                    type="date"
                    value={customStartDate}
                    max={customEndDate || todayStr}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    title="Tanggal Mulai"
                    className="chart-date-input"
                    aria-label="Tanggal Mulai"
                  />
                  <span className="date-dash">–</span>
                  <input
                    type="date"
                    value={customEndDate}
                    min={customStartDate}
                    max={todayStr}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    title="Tanggal Akhir"
                    className="chart-date-input"
                    aria-label="Tanggal Akhir"
                  />
                </div>
              </div>
            </div>
          </div>

          {dateError && (
            <div className="chart-date-error-banner">
              <AlertCircle size={13} />
              <span>{dateError}</span>
            </div>
          )}

          <div className="chart-legend">
            <div className="legend-items-wrap">
              <span className="legend-item">
                <span className="legend-dot in-dot" /> Stok Masuk (+)
              </span>
              <span className="legend-item">
                <span className="legend-dot out-dot" /> Stok Keluar (−)
              </span>
            </div>
            {chartData.length > 7 && (
              <span className="chart-scroll-hint caption">
                ← Geser horizontal untuk melihat riwayat sebelumnya
              </span>
            )}
          </div>

          <div className="chart-canvas-box" ref={chartScrollRef}>
            <div className="chart-bars-container">
              {chartData.map((d, idx) => {
                const inHeight = (d.inQty / maxChartQty) * 100;
                const outHeight = (d.outQty / maxChartQty) * 100;

                return (
                  <div key={idx} className={dayColClass} title={`${d.dateLabel}: Masuk ${d.inQty}, Keluar ${d.outQty}`}>
                    <div className="bars-pair">
                      <div
                        className="bar-item bar-in"
                        style={{ height: `${Math.max(d.inQty > 0 ? 4 : 0, inHeight)}%` }}
                      />
                      <div
                        className="bar-item bar-out"
                        style={{ height: `${Math.max(d.outQty > 0 ? 4 : 0, outHeight)}%` }}
                      />
                    </div>
                    <span className="bar-label">{d.dateLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stok Kritis Alert Panel */}
        <aside className="panel panel-alerts">
          <div className="section-header">
            <div className="section-title">Stok Rendah & Habis</div>
            <button className="text-button" onClick={() => navigate('/products')}>
              Semua
            </button>
          </div>

          {urgentList.length === 0 ? (
            <div className="empty-mini">
              <Box size={24} className="text-disabled" />
              <span>Semua stok berada pada level aman</span>
            </div>
          ) : (
            <div className="alert-list">
              {urgentList.map((product) => {
                const status = getInventoryStatus(product);
                const isHabis = status.status === 'Habis';

                return (
                  <div
                    key={product.id}
                    className={`alert-item-card ${isHabis ? 'alert-danger' : 'alert-warning'}`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="alert-icon-wrap">
                      {isHabis ? <PackageX size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div className="alert-item-info">
                      <strong>{product.name}</strong>
                      <small>SKU: {product.sku} · Min: {product.minStock} {product.unit}</small>
                    </div>
                    <div className="alert-item-stock">
                      <span className="stock-qty">{product.stock} {product.unit}</span>
                      <span className={`chip chip-xs ${isHabis ? 'chip-neg' : 'chip-warn'}`}>
                        {status.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>

      {/* BARIS 3: Transaksi Terbaru */}
      <section className="panel panel-table">
        <div className="section-header">
          <div>
            <div className="section-title">Transaksi Terbaru</div>
            <div className="caption">5 aktivitas transaksi terakhir tercatat</div>
          </div>
          <button className="button secondary" onClick={() => navigate('/transactions')}>
            Lihat Semua Transaksi
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="empty-mini">
            <span>Belum ada transaksi tercatat. Buat transaksi pertama Anda.</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal & Waktu</th>
                  <th>Tipe</th>
                  <th>Produk</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Nilai</th>
                  <th>Catatan / Alasan</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => {
                  const val = tx.price != null ? tx.price * Math.abs(tx.qty) : null;
                  return (
                    <tr key={tx.id} onClick={() => setSelectedTxn(tx)} className="clickable-row">
                      <td className="cell-date">{formatDate(tx.date, 'locale', true)}</td>
                      <td>
                        <span className={`chip chip-xs ${tx.type === 'in' ? 'chip-pos' : tx.type === 'out' ? 'chip-neg' : 'chip-neutral'}`}>
                          {tx.type === 'in' ? 'Masuk' : tx.type === 'out' ? 'Keluar' : 'Penyesuaian'}
                        </span>
                      </td>
                      <td>
                        <div className="cell-product">
                          <strong>{tx.productNameSnapshot}</strong>
                          <small>SKU: {tx.productSkuSnapshot}</small>
                        </div>
                      </td>
                      <td className={`text-right tabular-nums ${tx.type === 'in' ? 'text-pos' : tx.type === 'out' ? 'text-neg' : ''}`}>
                        {tx.type === 'in' ? `+${tx.qty}` : tx.type === 'out' ? `-${Math.abs(tx.qty)}` : (tx.qty > 0 ? `+${tx.qty}` : tx.qty)}
                      </td>
                      <td className="text-right tabular-nums">{val != null ? formatCurrency(val) : '—'}</td>
                      <td className="cell-note">{tx.note || tx.reason || '—'}</td>
                      <td className="text-right">
                        <button
                          className="icon-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTxn(tx);
                          }}
                          aria-label="Detail transaksi"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal Detail Transaksi */}
      <Modal
        isOpen={selectedTxn != null}
        onClose={() => setSelectedTxn(null)}
        title="Detail Transaksi"
        maxWidth="md"
      >
        {selectedTxn && (
          <div className="detail-grid">
            <div className="detail-row">
              <span className="caption">ID Transaksi</span>
              <span className="data font-mono">{selectedTxn.id}</span>
            </div>
            <div className="detail-row">
              <span className="caption">Tipe Transaksi</span>
              <span className={`chip chip-xs ${selectedTxn.type === 'in' ? 'chip-pos' : selectedTxn.type === 'out' ? 'chip-neg' : 'chip-neutral'}`}>
                {selectedTxn.type === 'in' ? 'Stok Masuk' : selectedTxn.type === 'out' ? 'Stok Keluar' : 'Penyesuaian (Opname)'}
              </span>
            </div>
            <div className="detail-row">
              <span className="caption">Produk (Snapshot)</span>
              <div>
                <strong>{selectedTxn.productNameSnapshot}</strong>
                <div className="caption">SKU: {selectedTxn.productSkuSnapshot}</div>
              </div>
            </div>
            <div className="detail-row">
              <span className="caption">Kuantitas</span>
              <strong className="tabular-nums">
                {selectedTxn.type === 'in' ? `+${selectedTxn.qty}` : selectedTxn.type === 'out' ? `-${Math.abs(selectedTxn.qty)}` : selectedTxn.qty}
              </strong>
            </div>
            <div className="detail-row">
              <span className="caption">Saldo Stok</span>
              <span className="tabular-nums">
                {selectedTxn.stockBefore} → <strong>{selectedTxn.stockAfter}</strong>
              </span>
            </div>
            {selectedTxn.price != null && (
              <div className="detail-row">
                <span className="caption">Harga per Unit</span>
                <span className="tabular-nums">{formatCurrency(selectedTxn.price)}</span>
              </div>
            )}
            {selectedTxn.price != null && (
              <div className="detail-row">
                <span className="caption">Total Nilai Transaksi</span>
                <strong className="tabular-nums">{formatCurrency(selectedTxn.price * Math.abs(selectedTxn.qty))}</strong>
              </div>
            )}
            {selectedTxn.supplierNameSnapshot && (
              <div className="detail-row">
                <span className="caption">Supplier Snapshot</span>
                <span>{selectedTxn.supplierNameSnapshot}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="caption">Alasan</span>
              <span>{selectedTxn.reason || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="caption">Catatan</span>
              <span>{selectedTxn.note || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="caption">Tanggal Transaksi</span>
              <span>{formatDate(selectedTxn.date, 'locale', true)}</span>
            </div>
            <div className="detail-row">
              <span className="caption">Waktu Pencatatan</span>
              <span>{formatDate(selectedTxn.createdAt, 'locale', true)}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Quick View Produk dari Alert */}
      <Modal
        isOpen={selectedProduct != null}
        onClose={() => setSelectedProduct(null)}
        title="Ringkasan Produk"
        maxWidth="sm"
      >
        {selectedProduct && (
          <div className="detail-grid">
            <div className="detail-row">
              <span className="caption">Nama Produk</span>
              <strong>{selectedProduct.name}</strong>
            </div>
            <div className="detail-row">
              <span className="caption">SKU</span>
              <span className="data font-mono">{selectedProduct.sku}</span>
            </div>
            <div className="detail-row">
              <span className="caption">Stok Saat Ini</span>
              <strong className="tabular-nums">{selectedProduct.stock} {selectedProduct.unit}</strong>
            </div>
            <div className="detail-row">
              <span className="caption">Batas Stok Minimum</span>
              <span className="tabular-nums">{selectedProduct.minStock} {selectedProduct.unit}</span>
            </div>
            <div className="detail-row">
              <span className="caption">Harga Beli</span>
              <span className="tabular-nums">{formatCurrency(selectedProduct.costPrice)}</span>
            </div>
            <div className="detail-row">
              <span className="caption">Lokasi</span>
              <span>{selectedProduct.location || '—'}</span>
            </div>
            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button
                className="button primary"
                onClick={() => {
                  navigate(`/stock-in?productId=${selectedProduct.id}`);
                  setSelectedProduct(null);
                }}
              >
                + Tambah Stok Masuk
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
