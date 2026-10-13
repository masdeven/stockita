import { Product } from '../../types';
import { useStockitaData } from '../../store/useStockitaStore';
import { formatCurrency, getInventoryStatus } from '../../lib/format';
import { useMemo, useState } from 'react';

const blankProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
  sku: '',
  name: '',
  categoryId: '',
  supplierId: '',
  unit: 'pcs',
  costPrice: 0,
  sellPrice: 0,
  stock: 0,
  minStock: 0,
  location: '',
  note: ''
};

export default function ProductPage() {
  const { products } = useStockitaData();
  const [form, setForm] = useState(blankProduct);

  const rows = useMemo(() => {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const onChange = (field: keyof typeof blankProduct, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = () => {
    const product: Product = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...form,
      sku: form.sku.trim(),
      name: form.name.trim()
    };

    useStockitaData();
    window.alert(`Produk ${product.name} ditambahkan (demo).`);
    setForm(blankProduct);
  };

  return (
    <div className="page-shell">
      <div className="panel form-panel">
        <div className="section-title">Tambah Produk</div>
        <div className="form-grid">
          <label>
            SKU
            <input value={form.sku} onChange={(e) => onChange('sku', e.target.value)} />
          </label>
          <label>
            Nama produk
            <input value={form.name} onChange={(e) => onChange('name', e.target.value)} />
          </label>
          <label>
            Satuan
            <input value={form.unit} onChange={(e) => onChange('unit', e.target.value)} />
          </label>
          <label>
            Stok awal
            <input type="number" value={form.stock} onChange={(e) => onChange('stock', Number(e.target.value))} />
          </label>
          <label>
            Harga beli
            <input type="number" value={form.costPrice} onChange={(e) => onChange('costPrice', Number(e.target.value))} />
          </label>
          <label>
            Harga jual
            <input type="number" value={form.sellPrice} onChange={(e) => onChange('sellPrice', Number(e.target.value))} />
          </label>
          <label>
            Lokasi
            <input value={form.location ?? ''} onChange={(e) => onChange('location', e.target.value)} />
          </label>
          <label>
            Stok minimum
            <input type="number" value={form.minStock} onChange={(e) => onChange('minStock', Number(e.target.value))} />
          </label>
        </div>
        <div className="actions-row">
          <button className="button primary">Simpan</button>
          <button className="button secondary" onClick={() => setForm(blankProduct)}>Reset</button>
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
              <th>Harga</th>
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
