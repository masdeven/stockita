import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStockitaStore } from '../../store/useStockitaStore';
import { formatCurrency, getInventoryStatus } from '../../lib/format';
import { parseCSVSafe } from '../../lib/export';
import { saveAs } from '../../lib/saveAs';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  Plus,
  Search,
  Filter,
  Download,
  Copy,
  Edit2,
  Trash2,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronRight,
  Box
} from 'lucide-react';
import type { Product } from '../../types';

interface ProductFormData {
  id?: string;
  sku: string;
  name: string;
  categoryId: string;
  supplierId: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  openingStock: number;
  minStock: number;
  location: string;
  note: string;
}

const defaultFormData: ProductFormData = {
  sku: '',
  name: '',
  categoryId: '',
  supplierId: '',
  unit: 'pcs',
  costPrice: 0,
  sellPrice: 0,
  openingStock: 0,
  minStock: 0,
  location: '',
  note: ''
};

export function ProductPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useStockitaStore((s) => s.products);
  const categories = useStockitaStore((s) => s.categories);
  const suppliers = useStockitaStore((s) => s.suppliers);
  const addProduct = useStockitaStore((s) => s.addProduct);
  const updateProduct = useStockitaStore((s) => s.updateProduct);
  const deleteProduct = useStockitaStore((s) => s.deleteProduct);
  const addToast = useStockitaStore((s) => s.addToast);
  const selectedProductId = useStockitaStore((s) => s.selectedProductId);
  const setSelectedProductId = useStockitaStore((s) => s.setSelectedProductId);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  // Modals & Panels
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Check URL action
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddModal();
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  // Selected product object
  const activeProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      // 1. Text search
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q));

      // 2. Category filter
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;

      // 3. Supplier filter
      const matchesSupplier = !supplierFilter || p.supplierId === supplierFilter;

      // 4. Status filter
      const status = getInventoryStatus(p).status;
      let matchesStatus = true;
      if (statusFilter === 'low') matchesStatus = status === 'Rendah' || status === 'Habis';
      else if (statusFilter === 'empty') matchesStatus = status === 'Habis';
      else if (statusFilter === 'normal') matchesStatus = status === 'Normal';

      return matchesSearch && matchesCategory && matchesSupplier && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, supplierFilter, statusFilter]);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData(defaultFormData);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (p: Product) => {
    setIsEditMode(true);
    setFormData({
      id: p.id,
      sku: p.sku,
      name: p.name,
      categoryId: p.categoryId || '',
      supplierId: p.supplierId || '',
      unit: p.unit || 'pcs',
      costPrice: p.costPrice || 0,
      sellPrice: p.sellPrice || 0,
      openingStock: p.stock || 0,
      minStock: p.minStock || 0,
      location: p.location || '',
      note: p.note || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleDuplicate = (p: Product) => {
    setIsEditMode(false);
    setFormData({
      sku: '',
      name: `${p.name} (Salinan)`,
      categoryId: p.categoryId || '',
      supplierId: p.supplierId || '',
      unit: p.unit || 'pcs',
      costPrice: p.costPrice || 0,
      sellPrice: p.sellPrice || 0,
      openingStock: 0,
      minStock: p.minStock || 0,
      location: p.location || '',
      note: p.note || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const sku = formData.sku.trim();
    const name = formData.name.trim();

    if (!sku) {
      errors.sku = 'SKU wajib diisi';
    } else {
      // Check uniqueness (case-insensitive)
      const existing = products.find(
        (p) => p.sku.toLowerCase() === sku.toLowerCase() && p.id !== formData.id
      );
      if (existing) {
        errors.sku = `SKU "${sku}" sudah digunakan oleh produk lain`;
      }
    }

    if (!name) {
      errors.name = 'Nama produk wajib diisi';
    }

    if (formData.costPrice < 0) {
      errors.costPrice = 'Harga beli tidak boleh negatif';
    }

    if (formData.sellPrice < 0) {
      errors.sellPrice = 'Harga jual tidak boleh negatif';
    }

    if (formData.minStock < 0) {
      errors.minStock = 'Stok minimum tidak boleh negatif';
    }

    if (!isEditMode && formData.openingStock < 0) {
      errors.openingStock = 'Stok awal tidak boleh negatif';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEditMode && formData.id) {
        const existing = products.find((p) => p.id === formData.id);
        if (!existing) return;

        const updated: Product = {
          ...existing,
          sku: formData.sku.trim(),
          name: formData.name.trim(),
          categoryId: formData.categoryId || undefined,
          supplierId: formData.supplierId || undefined,
          unit: formData.unit.trim() || 'pcs',
          costPrice: Number(formData.costPrice) || 0,
          sellPrice: Number(formData.sellPrice) || 0,
          minStock: Number(formData.minStock) || 0,
          location: formData.location.trim() || undefined,
          note: formData.note.trim() || undefined,
          updatedAt: Date.now()
        };

        await updateProduct(updated);
      } else {
        const newProduct: Product = {
          id: crypto.randomUUID(),
          sku: formData.sku.trim(),
          name: formData.name.trim(),
          categoryId: formData.categoryId || undefined,
          supplierId: formData.supplierId || undefined,
          unit: formData.unit.trim() || 'pcs',
          costPrice: Number(formData.costPrice) || 0,
          sellPrice: Number(formData.sellPrice) || 0,
          stock: Number(formData.openingStock) || 0,
          minStock: Number(formData.minStock) || 0,
          location: formData.location.trim() || undefined,
          note: formData.note.trim() || undefined,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        await addProduct(newProduct, Number(formData.openingStock) || 0);
      }

      setIsFormOpen(false);
    } catch (err: any) {
      // error handled by store toast
    }
  };

  // Export CSV products
  const handleExportCSV = () => {
    if (products.length === 0) {
      addToast('Tidak ada data produk untuk diekspor', 'error');
      return;
    }

    const headers = [
      'SKU',
      'Nama Produk',
      'Kategori',
      'Supplier',
      'Satuan',
      'Stok',
      'Stok Minimum',
      'Harga Beli',
      'Harga Jual',
      'Lokasi',
      'Catatan',
      'Status'
    ];

    const rows = filteredProducts.map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId)?.name || '';
      const sup = suppliers.find((s) => s.id === p.supplierId)?.name || '';
      const status = getInventoryStatus(p).status;
      return [
        p.sku,
        p.name,
        cat,
        sup,
        p.unit,
        p.stock,
        p.minStock,
        p.costPrice,
        p.sellPrice,
        p.location || '',
        p.note || '',
        status
      ];
    });

    const csvContent = parseCSVSafe([headers, ...rows]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `stockita-produk-${new Date().toISOString().slice(0, 10)}.csv`;
    saveAs(blob, filename);
    addToast('File CSV produk berhasil diunduh', 'success');
  };

  return (
    <div className="product-layout-wrap">
      <div className="page-shell product-main-content">
        {/* Header Toolbar */}
        <div className="toolbar-section">
          <div className="toolbar-title-row">
            <div>
              <h1 className="title-section">Master Data Produk</h1>
              <div className="caption">{filteredProducts.length} dari {products.length} produk terdaftar</div>
            </div>
            <div className="toolbar-actions-group">
              <button className="button secondary" onClick={handleExportCSV} title="Ekspor daftar produk ke CSV">
                <Download size={14} />
                <span>Export CSV</span>
              </button>
              <button className="button primary" onClick={openAddModal}>
                <Plus size={16} />
                <span>Tambah Produk</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="filter-bar">
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Cari nama, SKU, atau lokasi…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-input search-box-input"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Semua Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua Status Stok</option>
              <option value="normal">Normal</option>
              <option value="low">Rendah & Habis</option>
              <option value="empty">Habis</option>
            </select>

            {(searchQuery || categoryFilter || supplierFilter || statusFilter !== 'all') && (
              <button
                className="button secondary reset-filter-btn"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('');
                  setSupplierFilter('');
                  setStatusFilter('all');
                }}
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="panel panel-table">
          {filteredProducts.length === 0 ? (
            <div className="empty-state-card">
              <Box size={36} className="text-disabled" />
              <div className="empty-title">Tidak ada produk ditemukan</div>
              <p className="empty-desc">
                {products.length === 0
                  ? 'Katalog produk Anda masih kosong. Silakan tambah produk pertama Anda.'
                  : 'Tidak ada produk yang cocok dengan kriteria pencarian dan filter.'}
              </p>
              {products.length === 0 && (
                <button className="button primary" onClick={openAddModal}>
                  <Plus size={16} /> Tambah Produk Baru
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Nama Produk</th>
                    <th>Kategori</th>
                    <th className="text-right">Stok</th>
                    <th className="text-right">Harga Beli</th>
                    <th className="text-right">Harga Jual</th>
                    <th>Status</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const cat = categories.find((c) => c.id === p.categoryId);
                    const status = getInventoryStatus(p);
                    const isSelected = p.id === selectedProductId;

                    return (
                      <tr
                        key={p.id}
                        className={`clickable-row ${isSelected ? 'row-selected' : ''}`}
                        onClick={() => setSelectedProductId(isSelected ? null : p.id)}
                      >
                        <td className="cell-sku font-mono">{p.sku}</td>
                        <td className="cell-name">
                          <strong>{p.name}</strong>
                          {p.location && <span className="cell-sub">{p.location}</span>}
                        </td>
                        <td>{cat?.name || '—'}</td>
                        <td className="text-right tabular-nums">
                          <strong>{p.stock}</strong> <span className="caption">{p.unit}</span>
                        </td>
                        <td className="text-right tabular-nums">{formatCurrency(p.costPrice)}</td>
                        <td className="text-right tabular-nums">{formatCurrency(p.sellPrice)}</td>
                        <td>
                          <span
                            className={`chip chip-xs ${
                              status.status === 'Habis'
                                ? 'chip-neg'
                                : status.status === 'Rendah'
                                ? 'chip-warn'
                                : 'chip-pos'
                            }`}
                          >
                            {status.status}
                          </span>
                        </td>
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="row-actions">
                            <button
                              className="icon-button"
                              onClick={() => handleDuplicate(p)}
                              title="Duplikat produk"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              className="icon-button"
                              onClick={() => openEditModal(p)}
                              title="Edit produk"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="icon-button icon-button-danger"
                              onClick={() => setProductToDelete(p)}
                              title="Hapus produk"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Contextual Right Panel (Desktop 300px) */}
      {activeProduct && (
        <aside className="product-right-panel" aria-label="Detail Produk">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <span className="caption font-mono">{activeProduct.sku}</span>
              <h3 className="panel-product-title">{activeProduct.name}</h3>
            </div>
            <button
              className="icon-button"
              onClick={() => setSelectedProductId(null)}
              aria-label="Tutup panel detail"
            >
              <X size={16} />
            </button>
          </div>

          <div className="panel-scroll-content">
            <div className="panel-stat-hero">
              <div className="caption">Stok Tersedia</div>
              <div className="panel-hero-stock tabular-nums">
                {activeProduct.stock} <span className="unit-label">{activeProduct.unit}</span>
              </div>
              <div className="panel-hero-status">
                {(() => {
                  const s = getInventoryStatus(activeProduct);
                  return (
                    <span
                      className={`chip chip-xs ${
                        s.status === 'Habis' ? 'chip-neg' : s.status === 'Rendah' ? 'chip-warn' : 'chip-pos'
                      }`}
                    >
                      {s.status} (Min: {activeProduct.minStock} {activeProduct.unit})
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="key-stats-list">
              <div className="stat-row">
                <span className="caption">Harga Beli</span>
                <span className="data tabular-nums">{formatCurrency(activeProduct.costPrice)}</span>
              </div>
              <div className="stat-row">
                <span className="caption">Harga Jual</span>
                <span className="data tabular-nums">{formatCurrency(activeProduct.sellPrice)}</span>
              </div>
              <div className="stat-row">
                <span className="caption">Margin Keuntungan</span>
                <span className="data tabular-nums">
                  {activeProduct.sellPrice > activeProduct.costPrice
                    ? formatCurrency(activeProduct.sellPrice - activeProduct.costPrice)
                    : '—'}
                </span>
              </div>
              <div className="stat-row">
                <span className="caption">Nilai Inventori Produk</span>
                <span className="data tabular-nums">
                  {formatCurrency(activeProduct.stock * activeProduct.costPrice)}
                </span>
              </div>
              <div className="stat-row">
                <span className="caption">Kategori</span>
                <span className="data">
                  {categories.find((c) => c.id === activeProduct.categoryId)?.name || '—'}
                </span>
              </div>
              <div className="stat-row">
                <span className="caption">Supplier</span>
                <span className="data">
                  {suppliers.find((s) => s.id === activeProduct.supplierId)?.name || '—'}
                </span>
              </div>
              <div className="stat-row">
                <span className="caption">Lokasi Gudang / Rak</span>
                <span className="data">{activeProduct.location || '—'}</span>
              </div>
              <div className="stat-row">
                <span className="caption">Catatan</span>
                <span className="data">{activeProduct.note || '—'}</span>
              </div>
            </div>

            <div className="panel-quick-actions">
              <div className="overline">AKSI TRANSAKSI CEPAT</div>
              <div className="action-button-grid">
                <a
                  href={`/stock-in?productId=${activeProduct.id}`}
                  className="button secondary action-link"
                >
                  <ArrowDownLeft size={14} /> Stok Masuk
                </a>
                <a
                  href={`/stock-out?productId=${activeProduct.id}`}
                  className="button secondary action-link"
                >
                  <ArrowUpRight size={14} /> Stok Keluar
                </a>
                <a
                  href={`/stock-adjust?productId=${activeProduct.id}`}
                  className="button secondary action-link"
                >
                  <SlidersHorizontal size={14} /> Opname
                </a>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Modal Tambah / Edit Produk */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isEditMode ? 'Edit Metadata Produk' : 'Tambah Produk Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="form-modal-wrap">
          <div className="form-grid two-col">
            <label>
              SKU (Kode Unik)*
              <input
                type="text"
                placeholder="mis. SKU-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className={formErrors.sku ? 'input-error' : ''}
              />
              {formErrors.sku && <span className="field-error">{formErrors.sku}</span>}
            </label>

            <label>
              Nama Produk*
              <input
                type="text"
                placeholder="mis. Kopi Arabika 250g"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={formErrors.name ? 'input-error' : ''}
              />
              {formErrors.name && <span className="field-error">{formErrors.name}</span>}
            </label>

            <label>
              Kategori
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Pilih Kategori…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <label>
              Supplier
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              >
                <option value="">Pilih Supplier…</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>

            <label>
              Satuan
              <input
                type="text"
                placeholder="pcs, box, kg, liter"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </label>

            <label>
              Harga Beli (Modal Rp)
              <input
                type="number"
                min="0"
                step="any"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                className={formErrors.costPrice ? 'input-error' : ''}
              />
              {formErrors.costPrice && <span className="field-error">{formErrors.costPrice}</span>}
            </label>

            <label>
              Harga Jual (Rp)
              <input
                type="number"
                min="0"
                step="any"
                value={formData.sellPrice}
                onChange={(e) => setFormData({ ...formData, sellPrice: parseFloat(e.target.value) || 0 })}
                className={formErrors.sellPrice ? 'input-error' : ''}
              />
              {formErrors.sellPrice && <span className="field-error">{formErrors.sellPrice}</span>}
            </label>

            {!isEditMode ? (
              <label>
                Stok Awal (Unit)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.openingStock}
                  onChange={(e) => setFormData({ ...formData, openingStock: parseFloat(e.target.value) || 0 })}
                  className={formErrors.openingStock ? 'input-error' : ''}
                />
                <span className="caption">Jika {'>'} 0, transaksi pembukaan stok otomatis dicatat.</span>
                {formErrors.openingStock && <span className="field-error">{formErrors.openingStock}</span>}
              </label>
            ) : (
              <div className="info-stock-edit">
                <span className="caption">Stok Saat Ini (Hanya Dibaca)</span>
                <strong>{formData.openingStock} {formData.unit}</strong>
                <span className="caption">Koreksi stok dilakukan lewat menu Transaksi / Opname.</span>
              </div>
            )}

            <label>
              Batas Stok Minimum
              <input
                type="number"
                min="0"
                step="any"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                className={formErrors.minStock ? 'input-error' : ''}
              />
              <span className="caption">Alert muncul jika stok ≤ batas minimum</span>
            </label>

            <label>
              Lokasi Barang (Rak / Gudang)
              <input
                type="text"
                placeholder="mis. Rak A-02"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </label>

            <label className="full-width">
              Catatan Produk
              <textarea
                placeholder="Informasi tambahan atau spesifikasi barang…"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={() => setIsFormOpen(false)}>
              Batal
            </button>
            <button type="submit" className="button primary">
              {isEditMode ? 'Simpan Perubahan' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Product Dialog */}
      <ConfirmDialog
        isOpen={productToDelete != null}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => {
          if (productToDelete) {
            deleteProduct(productToDelete.id);
            setProductToDelete(null);
          }
        }}
        title="Hapus Produk"
        message={
          productToDelete && productToDelete.stock > 0
            ? `PERHATIAN: Produk "${productToDelete.name}" masih memiliki stok sebanyak ${productToDelete.stock} ${productToDelete.unit}! Menghapus produk ini akan menghapusnya dari master produk (catatan transaksi historis tetap tersimpan sebagai arsip). Lanjutkan?`
            : `Apakah Anda yakin ingin menghapus produk "${productToDelete?.name}"?`
        }
        confirmText="Hapus Produk"
        cancelText="Batal"
        isDestructive={true}
      />
    </div>
  );
}
