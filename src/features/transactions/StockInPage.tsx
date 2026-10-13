import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStockitaStore } from '../../store/useStockitaStore';
import { formatCurrency } from '../../lib/format';
import { ArrowDownLeft, Box } from 'lucide-react';
import type { Transaction } from '../../types';

export function StockInPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const products = useStockitaStore((s) => s.products);
  const suppliers = useStockitaStore((s) => s.suppliers);
  const addTransaction = useStockitaStore((s) => s.addTransaction);

  const initialProdId = searchParams.get('productId') || products[0]?.id || '';

  const [productId, setProductId] = useState(initialProdId);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [qty, setQty] = useState<number | ''>(1);
  const [price, setPrice] = useState<number | ''>('');
  const [supplierId, setSupplierId] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialProdId && !productId) {
      setProductId(initialProdId);
    }
  }, [initialProdId]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === productId) || null;
  }, [products, productId]);

  // Pre-fill default supplier if product has one
  useEffect(() => {
    if (selectedProduct && selectedProduct.supplierId && !supplierId) {
      setSupplierId(selectedProduct.supplierId);
    }
  }, [selectedProduct]);

  // Calculations
  const numQty = typeof qty === 'number' ? qty : 0;
  const currentStock = selectedProduct ? selectedProduct.stock : 0;
  const stockAfter = currentStock + numQty;
  const numPrice = typeof price === 'number' && !isNaN(price) ? price : null;
  const totalValue = numPrice != null && numQty > 0 ? numQty * numPrice : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedProduct) {
      newErrors.product = 'Pilih produk terlebih dahulu';
    }

    if (!numQty || numQty <= 0) {
      newErrors.qty = 'Kuantitas harus berupa angka lebih besar dari 0';
    }

    if (numPrice != null && numPrice < 0) {
      newErrors.price = 'Harga tidak boleh negatif';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const selectedSupplier = suppliers.find((s) => s.id === supplierId);
      const chosenDate = new Date(date).getTime() || Date.now();

      const txn: Transaction = {
        id: crypto.randomUUID(),
        type: 'in',
        productId: selectedProduct!.id,
        productSkuSnapshot: selectedProduct!.sku,
        productNameSnapshot: selectedProduct!.name,
        qty: numQty,
        stockBefore: currentStock,
        stockAfter: stockAfter,
        price: numPrice != null ? numPrice : (selectedProduct!.costPrice || undefined),
        supplierId: supplierId || undefined,
        supplierNameSnapshot: selectedSupplier?.name || undefined,
        reason: 'other',
        note: note.trim() || undefined,
        date: chosenDate,
        createdAt: Date.now()
      };

      await addTransaction(txn);
      navigate('/transactions');
    } catch (err) {
      // handled by store toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="toolbar-section">
        <h1 className="title-section">Pencatatan Stok Masuk</h1>
        <div className="caption">Catat penambahan barang masuk dari supplier, pembelian, atau restock</div>
      </div>

      <div className="form-panel-container">
        <form onSubmit={handleSubmit} className="panel form-panel">
          <div className="form-grid two-col">
            <label>
              Tanggal Transaksi*
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>

            <label>
              Pilih Produk*
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className={errors.product ? 'input-error' : ''}
              >
                <option value="">Pilih Produk Inventori…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Stok: {p.stock} {p.unit}
                  </option>
                ))}
              </select>
              {errors.product && <span className="field-error">{errors.product}</span>}
            </label>

            <label>
              Jumlah Kuantitas Masuk (Qty)*
              <input
                type="number"
                min="0.001"
                step="any"
                value={qty}
                onChange={(e) => setQty(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="mis. 10"
                className={errors.qty ? 'input-error' : ''}
              />
              {errors.qty && <span className="field-error">{errors.qty}</span>}
            </label>

            <label>
              Harga Beli per Unit (Opsional)
              <input
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder={selectedProduct ? `Default: ${selectedProduct.costPrice}` : 'Rp 0'}
                className={errors.price ? 'input-error' : ''}
              />
              <span className="caption">Bila kosong, menggunakan harga beli master produk.</span>
              {errors.price && <span className="field-error">{errors.price}</span>}
            </label>

            <label>
              Pemasok / Supplier (Opsional)
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Tanpa Supplier Khusus</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>

            <label className="full-width">
              Catatan Transaksi (Opsional)
              <textarea
                placeholder="mis. No. Invoice PO-2026/01, pengadaan awal bulan…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
          </div>

          {/* Live Preview Box */}
          <div className="preview-summary-card">
            <div className="preview-summary-row">
              <span className="caption">Stok Saat Ini:</span>
              <strong>{currentStock} {selectedProduct?.unit || 'unit'}</strong>
              <span className="preview-separator">→</span>
              <span className="caption">Stok Setelah Masuk:</span>
              <strong className="text-pos font-size-lg tabular-nums">
                {stockAfter} {selectedProduct?.unit || 'unit'}
              </strong>
            </div>

            <div className="preview-summary-row" style={{ marginTop: '6px' }}>
              <span className="caption">Estimasi Total Nilai Masuk:</span>
              <strong className="tabular-nums">
                {totalValue != null ? formatCurrency(totalValue) : 'Nilai belum dihitung'}
              </strong>
            </div>
          </div>

          <div className="actions-row">
            <button
              type="button"
              className="button secondary"
              onClick={() => navigate('/transactions')}
            >
              Batal
            </button>
            <button
              type="submit"
              className="button primary"
              disabled={submitting}
            >
              <ArrowDownLeft size={16} /> Simpan Stok Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
