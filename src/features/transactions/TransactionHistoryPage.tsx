import { useState, useMemo } from 'react';
import { useStockitaStore } from '../../store/useStockitaStore';
import { formatCurrency, formatDate } from '../../lib/format';
import { parseCSVSafe } from '../../lib/export';
import { saveAs } from '../../lib/saveAs';
import { Modal } from '../../components/ui/Modal';
import {
  History,
  Search,
  Download,
  Filter,
  ExternalLink,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Transaction } from '../../types';

export function TransactionHistoryPage() {
  const transactions = useStockitaStore((s) => s.transactions);
  const products = useStockitaStore((s) => s.products);
  const addToast = useStockitaStore((s) => s.addToast);
  const selectedTransactionId = useStockitaStore((s) => s.selectedTransactionId);
  const setSelectedTransactionId = useStockitaStore((s) => s.setSelectedTransactionId);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out' | 'adjust'>('all');
  const [productFilter, setProductFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Active transaction detail modal
  const [detailTxn, setDetailTxn] = useState<Transaction | null>(null);

  // Filtered transactions (sorted by date DESC, then createdAt DESC)
  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const startMs = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const endMs = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

    return transactions
      .filter((t) => {
        // 1. Text search (product name, sku, note, reason)
        const matchesSearch =
          !q ||
          t.productNameSnapshot.toLowerCase().includes(q) ||
          t.productSkuSnapshot.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q)) ||
          (t.reason && t.reason.toLowerCase().includes(q));

        // 2. Type filter
        const matchesType = typeFilter === 'all' || t.type === typeFilter;

        // 3. Product filter
        const matchesProduct = !productFilter || t.productId === productFilter;

        // 4. Date range filter
        const matchesStart = startMs == null || t.date >= startMs;
        const matchesEnd = endMs == null || t.date <= endMs;

        return matchesSearch && matchesType && matchesProduct && matchesStart && matchesEnd;
      })
      .sort((a, b) => b.date - a.date || b.createdAt - a.createdAt);
  }, [transactions, searchQuery, typeFilter, productFilter, startDate, endDate]);

  // Pagination calculations
  const totalItems = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Export filtered CSV (Neutralizing CSV formula injection)
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      addToast('Tidak ada data transaksi yang cocok untuk diekspor', 'error');
      return;
    }

    const headers = [
      'ID Transaksi',
      'Tanggal',
      'Waktu',
      'Tipe',
      'SKU Produk',
      'Nama Produk',
      'Kuantitas',
      'Saldo Sebelum',
      'Saldo Setelah',
      'Harga Satuan',
      'Total Nilai',
      'Supplier',
      'Alasan',
      'Catatan'
    ];

    const rows = filteredTransactions.map((t) => {
      const dateObj = new Date(t.date);
      const val = t.price != null ? t.price * Math.abs(t.qty) : '';
      const typeLabel = t.type === 'in' ? 'Stok Masuk' : t.type === 'out' ? 'Stok Keluar' : 'Penyesuaian';
      const signedQty = t.type === 'in' ? `+${t.qty}` : t.type === 'out' ? `-${Math.abs(t.qty)}` : t.qty;

      return [
        t.id,
        dateObj.toLocaleDateString('id-ID'),
        dateObj.toLocaleTimeString('id-ID'),
        typeLabel,
        t.productSkuSnapshot,
        t.productNameSnapshot,
        signedQty,
        t.stockBefore,
        t.stockAfter,
        t.price != null ? t.price : '',
        val,
        t.supplierNameSnapshot || '',
        t.reason || '',
        t.note || ''
      ];
    });

    const csvData = parseCSVSafe([headers, ...rows]);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const filename = `stockita-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
    saveAs(blob, filename);
    addToast(`${filteredTransactions.length} baris riwayat transaksi berhasil diekspor`, 'success');
  };

  return (
    <div className="page-shell">
      <div className="toolbar-section">
        <div className="toolbar-title-row">
          <div>
            <h1 className="title-section">Riwayat Transaksi Stok</h1>
            <div className="caption">
              Menampilkan {filteredTransactions.length} catatan mutasi inventori
            </div>
          </div>
          <button className="button secondary" onClick={handleExportCSV} title="Ekspor riwayat ke format CSV">
            <Download size={14} /> Export Riwayat (CSV)
          </button>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar filter-bar-wrap">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Cari produk, SKU, catatan…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-input search-box-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="all">Semua Tipe Transaksi</option>
            <option value="in">Stok Masuk</option>
            <option value="out">Stok Keluar</option>
            <option value="adjust">Penyesuaian (Opname)</option>
          </select>

          <select
            value={productFilter}
            onChange={(e) => {
              setProductFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">Semua Produk</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>

          <div className="date-filter-group">
            <span className="caption">Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-date-input"
            />
            <span className="caption">Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-date-input"
            />
          </div>

          {(searchQuery || typeFilter !== 'all' || productFilter || startDate || endDate) && (
            <button
              className="button secondary reset-filter-btn"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setProductFilter('');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Table Data */}
      <div className="panel panel-table">
        {totalItems === 0 ? (
          <div className="empty-state-card">
            <History size={36} className="text-disabled" />
            <div className="empty-title">Tidak ada transaksi ditemukan</div>
            <p className="empty-desc">
              {transactions.length === 0
                ? 'Belum ada mutasi stok yang tercatat.'
                : 'Tidak ada transaksi yang cocok dengan kriteria filter aktif.'}
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tanggal & Waktu</th>
                    <th>Tipe</th>
                    <th>Produk</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Nilai Transaksi</th>
                    <th>Alasan / Catatan</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((tx) => {
                    const isProductDeleted = !products.some((p) => p.id === tx.productId);
                    const val = tx.price != null ? tx.price * Math.abs(tx.qty) : null;
                    const isPositive = tx.type === 'in' || (tx.type === 'adjust' && tx.qty > 0);
                    const isNegative = tx.type === 'out' || (tx.type === 'adjust' && tx.qty < 0);

                    return (
                      <tr
                        key={tx.id}
                        className="clickable-row"
                        onClick={() => setDetailTxn(tx)}
                      >
                        <td className="cell-date">{formatDate(tx.date, 'locale', true)}</td>
                        <td>
                          <span
                            className={`chip chip-xs ${
                              tx.type === 'in'
                                ? 'chip-pos'
                                : tx.type === 'out'
                                ? 'chip-neg'
                                : 'chip-neutral'
                            }`}
                          >
                            {tx.type === 'in' ? 'Masuk' : tx.type === 'out' ? 'Keluar' : 'Penyesuaian'}
                          </span>
                        </td>
                        <td>
                          <div className="cell-product">
                            <strong>{tx.productNameSnapshot}</strong>
                            <div className="caption font-mono">
                              SKU: {tx.productSkuSnapshot}
                              {isProductDeleted && (
                                <span className="badge-deleted"> (Produk dihapus)</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td
                          className={`text-right tabular-nums ${
                            isPositive ? 'text-pos' : isNegative ? 'text-neg' : ''
                          }`}
                        >
                          <strong>
                            {tx.type === 'in'
                              ? `+${tx.qty}`
                              : tx.type === 'out'
                              ? `-${Math.abs(tx.qty)}`
                              : tx.qty > 0
                              ? `+${tx.qty}`
                              : tx.qty}
                          </strong>
                        </td>
                        <td className="text-right tabular-nums">
                          {val != null ? formatCurrency(val) : '—'}
                        </td>
                        <td className="cell-note">{tx.note || tx.reason || '—'}</td>
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="icon-button"
                            onClick={() => setDetailTxn(tx)}
                            title="Lihat detail transaksi"
                            aria-label="Lihat detail transaksi"
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

            {/* Pagination Controls */}
            <div className="pagination-bar">
              <div className="pagination-info caption">
                Menampilkan {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} transaksi
              </div>

              <div className="pagination-controls">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="page-size-select"
                >
                  <option value={25}>25 / halaman</option>
                  <option value={50}>50 / halaman</option>
                  <option value={100}>100 / halaman</option>
                </select>

                <button
                  className="icon-button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="current-page-label">
                  {currentPage} / {totalPages}
                </span>

                <button
                  className="icon-button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Detail Transaksi */}
      <Modal
        isOpen={detailTxn != null}
        onClose={() => setDetailTxn(null)}
        title="Detail Transaksi"
        maxWidth="md"
      >
        {detailTxn && (
          <div className="detail-grid">
            <div className="detail-row">
              <span className="caption">ID Transaksi</span>
              <span className="data font-mono">{detailTxn.id}</span>
            </div>
            <div className="detail-row">
              <span className="caption">Tipe Transaksi</span>
              <span
                className={`chip chip-xs ${
                  detailTxn.type === 'in'
                    ? 'chip-pos'
                    : detailTxn.type === 'out'
                    ? 'chip-neg'
                    : 'chip-neutral'
                }`}
              >
                {detailTxn.type === 'in'
                  ? 'Stok Masuk'
                  : detailTxn.type === 'out'
                  ? 'Stok Keluar'
                  : 'Penyesuaian (Opname)'}
              </span>
            </div>
            <div className="detail-row">
              <span className="caption">Produk (Snapshot)</span>
              <div>
                <strong>{detailTxn.productNameSnapshot}</strong>
                <div className="caption font-mono">
                  SKU: {detailTxn.productSkuSnapshot}
                  {!products.some((p) => p.id === detailTxn.productId) && (
                    <span className="badge-deleted"> (Produk dihapus)</span>
                  )}
                </div>
              </div>
            </div>
            <div className="detail-row">
              <span className="caption">Perubahan Qty</span>
              <strong className="tabular-nums">
                {detailTxn.type === 'in'
                  ? `+${detailTxn.qty}`
                  : detailTxn.type === 'out'
                  ? `-${Math.abs(detailTxn.qty)}`
                  : detailTxn.qty > 0
                  ? `+${detailTxn.qty}`
                  : detailTxn.qty}
              </strong>
            </div>
            <div className="detail-row">
              <span className="caption">Saldo Stok</span>
              <span className="tabular-nums">
                {detailTxn.stockBefore} → <strong>{detailTxn.stockAfter}</strong>
              </span>
            </div>
            {detailTxn.price != null && (
              <div className="detail-row">
                <span className="caption">Harga Satuan</span>
                <span className="tabular-nums">{formatCurrency(detailTxn.price)}</span>
              </div>
            )}
            {detailTxn.price != null && (
              <div className="detail-row">
                <span className="caption">Total Nilai</span>
                <strong className="tabular-nums">
                  {formatCurrency(detailTxn.price * Math.abs(detailTxn.qty))}
                </strong>
              </div>
            )}
            {detailTxn.supplierNameSnapshot && (
              <div className="detail-row">
                <span className="caption">Supplier (Snapshot)</span>
                <span>{detailTxn.supplierNameSnapshot}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="caption">Alasan</span>
              <span>{detailTxn.reason || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="caption">Catatan</span>
              <span>{detailTxn.note || '—'}</span>
            </div>
            <div className="detail-row">
              <span className="caption">Tanggal Transaksi</span>
              <span>{formatDate(detailTxn.date, 'locale', true)}</span>
            </div>
            <div className="detail-row">
              <span className="caption">Waktu Pencatatan</span>
              <span>{formatDate(detailTxn.createdAt, 'locale', true)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
