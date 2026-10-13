import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStockitaStore } from '../../store/useStockitaStore';
import { formatCurrency } from '../../lib/format';
import { ArrowUpRight } from 'lucide-react';
import type { Transaction } from '../../types';

const reasonOptions = [
  { value: 'sale', label: 'Penjualan' },
  { value: 'damaged', label: 'Barang Rusak / Kadaluarsa' },
  { value: 'lost', label: 'Barang Hilang / Selisih Fisik' },
  { value: 'transfer', label: 'Transfer Lokasi' },
  { value: 'other', label: 'Lainnya' }
] as const;

export function StockOutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const products = useStockitaStore((s) => s.products);
  const addTransaction = useStockitaStore((s) => s.addTransaction);

  const initialProdId = searchParams.get('productId') || products[0]?.id || '';

  const [productId, setProductId] = useState(initialProdId);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [qty, setQty] = useState<number | ''>(1);
  const [price, setPrice] = useState<number | ''>('');
  const [reason, setReason] = useState<Transaction['reason']>('sale');
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

  // Calculations
  const numQty = typeof qty === 'number' ? qty : 0;
  const currentStock = selectedProduct ? selectedProduct.stock : 0;
  const stockAfter = currentStock - numQty;
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
    } else if (numQty > currentStock) {
      newErrors.qty = `Kuantitas melebihi stok yang tersedia (Stok tersedia: ${currentStock} ${selectedProduct?.unit || 'unit'})`;
    }

    if (numPrice != null && numPrice < 0) {
      newErrors.price = 'Harga tidak boleh negatif';
    }

    if (reason === 'other' && !note.trim()) {
      newErrors.note = 'Harap isi keterangan/catatan untuk alasan "Lainnya"';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const chosenDate = new Date(date).getTime() || Date.now();

      const txn: Transaction = {
        id: crypto.randomUUID(),
        type: 'out',
        productId: selectedProduct!.id,
        productSkuSnapshot: selectedProduct!.sku,
        productNameSnapshot: selectedProduct!.name,
        qty: -numQty, // out transactions store negative qty in calculations or absolute in repository
        stockBefore: currentStock,
        stockAfter: stockAfter,
        price: numPrice != null ? numPrice : (selectedProduct!.sellPrice || undefined),
        reason,
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
        <h1 className="title-section">Pencatatan Stok Keluar</h1>
        <div className="caption">Catat pengurangan barang karena penjualan, rusak, hilang, atau pemakaian</div>
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
                    {p.name} ({p.sku}) — Stok Tersedia: {p.stock} {p.unit}
                  </option>
                ))}
              </select>
              {errors.product && <span className="field-error">{errors.product}</span>}
            </label>

            <label>
              Kuantitas Keluar (Qty)*
              <input
                type="number"
                min="0.001"
                max={currentStock > 0 ? currentStock : undefined}
                step="any"
                value={qty}
                onChange={(e) => setQty(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="mis. 2"
                className={errors.qty ? 'input-error' : ''}
              />
              <span className="caption">Maksimum: {currentStock} {selectedProduct?.unit || 'unit'}</span>
              {errors.qty && <span className="field-error">{errors.qty}</span>}
            </label>

            <label>
              Harga per Unit (Opsional)
              <input
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder={selectedProduct ? `Default: ${selectedProduct.sellPrice}` : 'Rp 0'}
                className={errors.price ? 'input-error' : ''}
              />
              <span className="caption">Bila kosong, menggunakan harga jual master produk.</span>
              {errors.price && <span className="field-error">{errors.price}</span>}
            </label>

            <label>
              Alasan Pengeluaran Stok*
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as Transaction['reason'])}
              >
                {reasonOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="full-width">
              Catatan / Keterangan {reason === 'other' ? '*' : '(Opsional)'}
              <textarea
                placeholder="mis. Nota penjualan #1024, barang pecah saat pengiriman…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={errors.note ? 'input-error' : ''}
              />
              {errors.note && <span className="field-error">{errors.note}</span>}
            </label>
          </div>

          {/* Live Preview Box */}
          <div className="preview-summary-card">
            <div className="preview-summary-row">
              <span className="caption">Stok Tersedia:</span>
              <strong>{currentStock} {selectedProduct?.unit || 'unit'}</strong>
              <span className="preview-separator">→</span>
              <span className="caption">Sisa Stok Setelah Keluar:</span>
              <strong className={`font-size-lg tabular-nums ${stockAfter < 0 ? 'text-neg' : 'text-primary'}`}>
                {stockAfter} {selectedProduct?.unit || 'unit'}
              </strong>
            </div>

            <div className="preview-summary-row" style={{ marginTop: '6px' }}>
              <span className="caption">Estimasi Total Nilai Keluar:</span>
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
              className="button primary danger-btn"
              disabled={submitting || (currentStock <= 0)}
            >
              <ArrowUpRight size={16} /> Simpan Stok Keluar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
