import { useState } from 'react';
import { useStockitaStore } from '../../store/useStockitaStore';

export default function TransactionPage() {
  const products = useStockitaStore((state) => state.products);
  const addTransaction = useStockitaStore((state) => state.addTransaction);
  const initialize = useStockitaStore((s) => s.initialize);

  const [form, setForm] = useState({
    productId: products[0]?.id ?? '',
    type: 'in' as 'in' | 'out' | 'adjust',
    qty: 1,
    price: 0,
    physicalStock: undefined as number | undefined,
    reason: 'sale',
    note: ''
  });

  const product = products.find((item) => item.id === form.productId) ?? products[0];

  const handleSubmit = async () => {
    if (!product) { alert('Produk belum tersedia.'); return; }

    const qty = Number(form.qty) || 0;
    if (form.type === 'adjust') {
      if (form.physicalStock == null || !Number.isFinite(form.physicalStock) || form.physicalStock < 0) {
        alert('Stok fisik harus berupa angka >= 0.');
        return;
      }
      const diff = form.physicalStock - product.stock;
      if (diff === 0) { alert('Stok sudah sesuai. Tidak ada penyesuaian yang perlu disimpan.'); return; }

      const tx = {
        id: crypto.randomUUID(),
        type: 'adjust' as const,
        productId: product.id,
        productSkuSnapshot: product.sku,
        productNameSnapshot: product.name,
        qty: diff, // signed
        stockBefore: product.stock,
        stockAfter: form.physicalStock,
        price: undefined,
        note: form.note,
        date: Date.now(),
        createdAt: Date.now(),
        reason: 'stocktake'
      };

      await addTransaction(tx);
      alert('Penyesuaian disimpan.');
      await initialize();
      return;
    }

    if (qty <= 0) { alert('Kuantitas harus lebih dari 0.'); return; }
    if (form.type === 'out' && qty > product.stock) { alert(`Stok tersedia: ${product.stock}`); return; }

    const stockAfter = form.type === 'in' ? product.stock + qty : product.stock - qty;

    const tx = {
      id: crypto.randomUUID(),
      type: form.type,
      productId: product.id,
      productSkuSnapshot: product.sku,
      productNameSnapshot: product.name,
      qty: qty,
      stockBefore: product.stock,
      stockAfter,
      price: form.price || undefined,
      note: form.note,
      date: Date.now(),
      createdAt: Date.now(),
      reason: form.type === 'in' ? 'opening-stock' : 'sale'
    } as any;

    await addTransaction(tx);
    alert('Transaksi berhasil disimpan.');
    await initialize();
  };

  return (
    <div className="page-shell">
      <div className="panel form-panel">
        <div className="section-title">Transaksi Stok</div>
        <div className="form-grid">
          <label>
            Produk
            <select value={form.productId} onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))}>
              {products.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label>
            Tipe
            <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as 'in' | 'out' | 'adjust' }))}>
              <option value="in">Stok Masuk</option>
              <option value="out">Stok Keluar</option>
              <option value="adjust">Penyesuaian / Opname</option>
            </select>
          </label>
          {form.type !== 'adjust' ? (
            <>
              <label>
                Qty
                <input type="number" value={form.qty} onChange={(e) => setForm((prev) => ({ ...prev, qty: Number(e.target.value) }))} />
              </label>
              <label>
                Harga per unit
                <input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))} />
              </label>
            </>
          ) : (
            <label className="full-width">
              Stok fisik
              <input type="number" value={form.physicalStock ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, physicalStock: e.target.value === '' ? undefined : Number(e.target.value) }))} />
            </label>
          )}

          <label className="full-width">
            Alasan/Catatan
            <textarea value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
          </label>
        </div>

        <div className="summary-box">
          <strong>Stok saat ini:</strong> {product?.stock ?? 0}
          <span> | </span>
          <strong>Setelah transaksi:</strong> {product ? (form.type === 'adjust' ? (form.physicalStock ?? product.stock) : (form.type === 'in' ? product.stock + Number(form.qty || 0) : product.stock - Number(form.qty || 0))) : 0}
        </div>

        <div className="actions-row">
          <button className="button primary" onClick={handleSubmit}>Simpan</button>
        </div>
      </div>
    </div>
  );
}
