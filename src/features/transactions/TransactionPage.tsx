import { useState } from 'react';
import { useStockitaStore } from '../../store/useStockitaStore';
import { useStockitaData } from '../../store/useStockitaStore';

export default function TransactionPage() {
  const { products } = useStockitaData();
  const addTransaction = useStockitaStore((state) => state.addTransaction);
  const [form, setForm] = useState({
    productId: products[0]?.id ?? '',
    type: 'in',
    qty: 1,
    price: 0,
    note: ''
  });

  const product = products.find((item) => item.id === form.productId) ?? products[0];

  const submit = () => {
    if (!product) return;

    const qty = Number(form.qty);
    const nextStock = form.type === 'in' ? product.stock + qty : product.stock - qty;

    addTransaction({
      id: crypto.randomUUID(),
      type: form.type,
      productId: product.id,
      productSkuSnapshot: product.sku,
      productNameSnapshot: product.name,
      qty: form.type === 'in' ? qty : -qty,
      stockBefore: product.stock,
      stockAfter: nextStock,
      price: form.price || undefined,
      note: form.note,
      date: Date.now(),
      createdAt: Date.now()
    });

    window.alert('Transaksi demo berhasil disimpan.');
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
            <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as 'in' | 'out' }))}>
              <option value="in">Masuk</option>
              <option value="out">Keluar</option>
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
          <strong>Setelah transaksi:</strong> {product ? (form.type === 'in' ? product.stock + Number(form.qty) : product.stock - Number(form.qty)) : 0}
        </div>

        <div className="actions-row">
          <button className="button primary" onClick={submit}>Simpan</button>
        </div>
      </div>
    </div>
  );
}
