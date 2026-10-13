import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStockitaStore } from '../../store/useStockitaStore';
import { SlidersHorizontal, Info, CheckCircle2 } from 'lucide-react';
import type { Transaction } from '../../types';

export function StockAdjustPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const products = useStockitaStore((s) => s.products);
  const addTransaction = useStockitaStore((s) => s.addTransaction);

  const initialProdId = searchParams.get('productId') || products[0]?.id || '';

  const [productId, setProductId] = useState(initialProdId);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [physicalStock, setPhysicalStock] = useState<number | ''>('');
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

  // Set default physical stock to match current system stock when selecting product
  useEffect(() => {
    if (selectedProduct && physicalStock === '') {
      setPhysicalStock(selectedProduct.stock);
    }
  }, [selectedProduct]);

  const currentSystemStock = selectedProduct ? selectedProduct.stock : 0;
  const numPhysical = typeof physicalStock === 'number' ? physicalStock : currentSystemStock;
  const difference = numPhysical - currentSystemStock;
  const isZeroDifference = difference === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!selectedProduct) {
      newErrors.product = 'Pilih produk terlebih dahulu';
    }

    if (typeof physicalStock !== 'number' || physicalStock < 0) {
      newErrors.physicalStock = 'Stok fisik harus berupa angka 0 atau lebih';
    }

    if (isZeroDifference) {
      newErrors.difference = 'Stok sudah sesuai. Tidak ada penyesuaian yang perlu disimpan.';
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
        type: 'adjust',
        productId: selectedProduct!.id,
        productSkuSnapshot: selectedProduct!.sku,
        productNameSnapshot: selectedProduct!.name,
        qty: difference, // signed difference
        stockBefore: currentSystemStock,
        stockAfter: numPhysical,
        price: selectedProduct!.costPrice || undefined,
        reason: 'stocktake',
        note: note.trim() || 'Stok Opname / Penyesuaian Fisik',
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
        <h1 className="title-section">Penyesuaian Stok / Stok Opname</h1>
        <div className="caption">
          Input hasil perhitungan fisik nyata di gudang untuk merekonsiliasi selisih dengan saldo sistem
        </div>
      </div>

      <div className="form-panel-container">
        <form onSubmit={handleSubmit} className="panel form-panel">
          <div className="form-grid two-col">
            <label>
              Tanggal Opname*
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
                onChange={(e) => {
                  setProductId(e.target.value);
                  const prod = products.find((p) => p.id === e.target.value);
                  if (prod) setPhysicalStock(prod.stock);
                }}
                className={errors.product ? 'input-error' : ''}
              >
                <option value="">Pilih Produk Inventori…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Stok Sistem: {p.stock} {p.unit}
                  </option>
                ))}
              </select>
              {errors.product && <span className="field-error">{errors.product}</span>}
            </label>

            <label>
              Hasil Hitung Stok Fisik Nyata*
              <input
                type="number"
                min="0"
                step="any"
                value={physicalStock}
                onChange={(e) => setPhysicalStock(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Jumlah unit fisik sebenarnya"
                className={errors.physicalStock ? 'input-error' : ''}
              />
              <span className="caption">Masukkan jumlah aktual barang yang dihitung di tempat.</span>
              {errors.physicalStock && <span className="field-error">{errors.physicalStock}</span>}
            </label>

            <label className="full-width">
              Catatan / Alasan Penyesuaian
              <textarea
                placeholder="mis. Selisih opname akhir bulan, koreksi kesalahan hitung…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
          </div>

          {/* Live Opname Difference Box */}
          <div className="preview-summary-card">
            <div className="preview-summary-row">
              <span className="caption">Stok Sistem Saat Ini:</span>
              <strong className="tabular-nums">{currentSystemStock} {selectedProduct?.unit || 'unit'}</strong>
              <span className="preview-separator">→</span>
              <span className="caption">Stok Fisik Diinput:</span>
              <strong className="font-size-lg tabular-nums">
                {numPhysical} {selectedProduct?.unit || 'unit'}
              </strong>
            </div>

            <div className="preview-summary-row" style={{ marginTop: '8px' }}>
              <span className="caption">Selisih Penyesuaian:</span>
              <span
                className={`stat-pill tabular-nums ${
                  difference > 0 ? 'pill-pos' : difference < 0 ? 'pill-neg' : 'pill-neutral'
                }`}
              >
                {difference > 0 ? `+${difference}` : difference < 0 ? difference : '±0'}{' '}
                {selectedProduct?.unit || 'unit'}
              </span>
            </div>

            {isZeroDifference && (
              <div className="info-banner" style={{ marginTop: '10px' }}>
                <CheckCircle2 size={16} className="text-pos" />
                <span>Stok fisik sama dengan sistem. Tidak ada selisih yang perlu disesuaikan.</span>
              </div>
            )}
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
              disabled={submitting || isZeroDifference}
            >
              <SlidersHorizontal size={16} /> Simpan Penyesuaian Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
