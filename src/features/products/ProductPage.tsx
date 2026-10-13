import { useMemo, useState } from 'react';
import { formatCurrency, getInventoryStatus } from '../../lib/format';
import { useStockitaStore } from '../../store/useStockitaStore';
import type { Product } from '../../types';

const emptyForm = {
  sku: '',
  name: '',
  unit: 'pcs',
  costPrice: 0,
  sellPrice: 0,
  stock: 0,
  minStock: 0,
  location: '',
  note: ''
};

export function ProductPage() {
  const products = useStockitaStore((state) => state.products);
  const addProduct = useStockitaStore((state) => state.addProduct);
  const [form, setForm] = useState(emptyForm);

  const rows = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name)), [products]);

  const handleSubmit = async () => {
    const sku = form.sku.trim();
    const name = form.name.trim();
    if (!sku || !name) {
      alert('SKU dan nama produk wajib diisi.');
      return;
    }

    const product: Product = {
      id: crypto.randomUUID(),
      sku,
      name,
      unit: form.unit || 'pcs',
      costPrice: Number(form.costPrice) || 0,
      sellPrice: Number(form.sellPrice) || 0,
      stock: Number(form.stock) || 0,
      minStock: Number(form.minStock) || 0,
      location: form.location,
      note: form.note,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await addProduct(product, Number(form.stock) || 0);
    setForm(emptyForm);
  };

  return (
    <div className="page-shell">
      <div className="panel form-panel">
        <div className="section-title">Tambah Produk</div>
        <div className="form-grid">
          <label>
            SKU
            <input value={form.sku} onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))} />
          </label>
          <label>
            Nama produk
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          </label>
          <label>
            Satuan
            <input value={form.unit} onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))} />
          </label>
          <label>
            Stok awal
            <input type="number" value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))} />
          </label>
          <label>
            Harga beli
            <input type="number" value={form.costPrice} onChange={(e) => setForm((prev) => ({ ...prev, costPrice: Number(e.target.value) }))} />
          </label>
          <label>
            Harga jual
            <input type="number" value={form.sellPrice} onChange={(e) => setForm((prev) => ({ ...prev, sellPrice: Number(e.target.value) }))} />
          </label>
          <label>
            Lokasi
            <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />
          </label>
          <label>
            Stok minimum
            <input type="number" value={form.minStock} onChange={(e) => setForm((prev) => ({ ...prev, minStock: Number(e.target.value) }))} />
          </label>
          <label className="full-width">
            Catatan
            <textarea value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
          </label>
        </div>
        <div className="actions-row">
          <button className="button primary" onClick={handleSubmit}>Simpan</button>
          <button className="button secondary" onClick={() => setForm(emptyForm)}>Reset</button>
        </div>
      </div>

      <div className="panel">
        <div className="section-header">
          <div className="section-title">Daftar Produk</div>
          <span className="badge neutral">{rows.length} item</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nama</th>
              <th>Stok</th>
              <th>Harga Beli</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((product) => {
              const status = getInventoryStatus(product);
              return (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.stock}</td>
                  <td>{formatCurrency(product.costPrice)}</td>
                  <td>
                    <span className={`badge ${status.status === 'Habis' ? 'negative' : status.status === 'Rendah' ? 'warning' : 'positive'}`}>
                      {status.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductPage;
