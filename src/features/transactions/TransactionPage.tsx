import { useState } from 'react';
import { useStockitaStore } from '../../store/useStockitaStore';

export function TransactionPage() {
  const products = useStockitaStore((state) => state.products);
  const addTransaction = useStockitaStore((state) => state.addTransaction);
  const [form, setForm] = useState({
    productId: products[0]?.id ?? '',
    type: 'in' as 'in' | 'out' | 'adjust',
    qty: 1,
    price: 0,
    note: ''
  });

  const product = products.find((item) => item.id === form.productId) ?? products[0];

  const handleSubmit = async () => {
    if (!product) {
      alert('Produk belum tersedia.');
      return;
    }

    const qty = Number(form.qty) || 0;
    if (qty <= 0) {
      alert('Kuantitas harus lebih dari 0.');
      return;
    }

    const productQty = form.type === 'in' ? product.stock + qty : product.stock - qty;
    const transaction = {
      id: crypto.randomUUID(),
      type: form.type,
      productId: product.id,
      productSkuSnapshot: product.sku,
      productNameSnapshot: product.name,
      qty: form.type === 'in' ? qty : -qty,
      stockBefore: product.stock,
      stockAfter: productQty,
      price: Number(form.price) || undefined,
      note: form.note,
      date: Date.now(),
      createdAt: Date.now(),
      reason: 'sale'
    };

    await addTransaction(transaction);
    alert('Transaksi berhasil disimpan.');
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
              <option value="adjust">Penyesuaian</option>
            </select>
          </label>
          <label>
            Qty
            <input type="number" value={form.qty} onChange={(e) => setForm((prev) => ({ ...prev, qty: Number(e.target.value) }))} />
          </label>
          <label>
            Harga per unit
            <input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))} />
          </label>
          <label className="full-width">
            Catatan
            <textarea value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
          </label>
        </div>

        <div className="summary-box">
          <strong>Stok saat ini:</strong> {product?.stock ?? 0}
          <span> | </span>
          <strong>Setelah transaksi:</strong> {product ? (form.type === 'in' ? product.stock + Number(form.qty || 0) : product.stock - Number(form.qty || 0)) : 0}
        </div>

        <div className="actions-row">
          <button className="button primary" onClick={handleSubmit}>Simpan</button>
        </div>
      </div>
    </div>
  );
}
