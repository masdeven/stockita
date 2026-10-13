import { useEffect, useState } from 'react';
import { useStockitaStore } from '../../store/useStockitaStore';
import type { Supplier } from '../../types';
import { createSupplier, deleteSupplier, updateSupplier } from '../../db/repositories/suppliers';

const empty: Partial<Supplier> = { name: '', contact: '', address: '', note: '' };

export function SupplierPage() {
  const suppliers = useStockitaStore((s) => s.suppliers);
  const initialize = useStockitaStore((s) => s.initialize);
  const [form, setForm] = useState<Partial<Supplier>>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSave = async () => {
    if (!form.name || !form.name.trim()) {
      alert('Nama supplier wajib.');
      return;
    }

    setLoading(true);
    try {
      const payload: Supplier = {
        id: editingId ?? crypto.randomUUID(),
        name: form.name.trim(),
        contact: form.contact || '',
        address: form.address || '',
        note: form.note || '',
        createdAt: editingId ? suppliers.find((item) => item.id === editingId)?.createdAt ?? Date.now() : Date.now(),
        updatedAt: Date.now()
      };

      if (editingId) {
        await updateSupplier(payload);
      } else {
        await createSupplier(payload);
      }

      await initialize();
      setForm(empty);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Supplier) => {
    setEditingId(item.id);
    setForm({ ...item });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus supplier? Produk yang memakai supplier ini akan kehilangan relasi supplier.')) {
      return;
    }

    setLoading(true);
    try {
      await deleteSupplier(id);
      await initialize();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus supplier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="panel form-panel">
        <div className="section-title">Supplier</div>
        <div className="form-grid">
          <label>
            Nama
            <input value={form.name ?? ''} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
          </label>
          <label>
            Kontak
            <input value={form.contact ?? ''} onChange={(e) => setForm((current) => ({ ...current, contact: e.target.value }))} />
          </label>
          <label>
            Alamat
            <input value={form.address ?? ''} onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))} />
          </label>
          <label className="full-width">
            Catatan
            <textarea value={form.note ?? ''} onChange={(e) => setForm((current) => ({ ...current, note: e.target.value }))} />
          </label>
        </div>
        <div className="actions-row">
          <button className="button primary" onClick={handleSave} disabled={loading}>
            {editingId ? 'Simpan Perubahan' : 'Tambah Supplier'}
          </button>
          <button className="button secondary" onClick={() => { setForm(empty); setEditingId(null); }} disabled={loading}>
            Batal
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="section-header">
          <div className="section-title">Daftar Supplier</div>
          <span className="badge neutral">{suppliers.length} item</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Kontak</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.contact}</td>
                <td>
                  <button className="button secondary" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="button" style={{ marginLeft: 8 }} onClick={() => handleDelete(item.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SupplierPage;
