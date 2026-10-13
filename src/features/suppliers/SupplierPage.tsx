import { useEffect, useState } from 'react';
import { useStockitaStore } from '../../store/useStockitaStore';
import type { Supplier } from '../../types';
import { createSupplier, updateSupplier, deleteSupplier } from '../../db/repositories/suppliers';

const empty: Partial<Supplier> = { name: '', contact: '', address: '', note: '' };

export default function SupplierPage() {
  const suppliers = useStockitaStore((s) => s.suppliers);
  const initialize = useStockitaStore((s) => s.initialize);
  const [form, setForm] = useState<Partial<Supplier>>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { initialize(); }, [initialize]);

  const handleSave = async () => {
    if (!form.name || !form.name.trim()) return alert('Nama supplier wajib.');
    setLoading(true);
    try {
      const payload: Supplier = {
        id: editingId ?? crypto.randomUUID(),
        name: form.name!.trim(),
        contact: form.contact || '',
        address: form.address || '',
        note: form.note || '',
        createdAt: editingId ? (suppliers.find(s => s.id === editingId)?.createdAt ?? Date.now()) : Date.now(),
        updatedAt: Date.now()
      };

      if (editingId) await updateSupplier(payload);
      else await createSupplier(payload);

      await initialize();
      setForm(empty);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan supplier');
    } finally { setLoading(false); }
  };

  const handleEdit = (s: Supplier) => {
    setEditingId(s.id);
    setForm({ ...s });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus supplier? Produk yang memakai supplier ini akan kehilangan relasi supplier.')) return;
    setLoading(true);
    try {
      await deleteSupplier(id);
      await initialize();
    } catch (err) { console.error(err); alert('Gagal menghapus supplier'); } finally { setLoading(false); }
  };

  return (
    <div className="page-shell">
      <div className="panel form-panel">
        <div className="section-title">Supplier</div>
        <div className="form-grid">
          <label>
            Nama
            <input value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label>
            Kontak
            <input value={form.contact ?? ''} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
          </label>
          <label>
            Alamat
            <input value={form.address ?? ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </label>
          <label className="full-width">
            Catatan
            <textarea value={form.note ?? ''} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          </label>
        </div>
        <div className="actions-row">
          <button className="button primary" onClick={handleSave} disabled={loading}>{editingId ? 'Simpan Perubahan' : 'Tambah Supplier'}</button>
          <button className="button secondary" onClick={() => { setForm(empty); setEditingId(null); }} disabled={loading}>Batal</button>
        </div>
      </div>

      <div className="panel">
        <div className="section-header">
          <div className="section-title">Daftar Supplier</div>
          <span className="badge neutral">{suppliers.length} item</span>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Nama</th><th>Kontak</th><th></th></tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.contact}</td>
                <td>
                  <button className="button secondary" onClick={() => handleEdit(s)}>Edit</button>
                  <button className="button" style={{ marginLeft: 8 }} onClick={() => handleDelete(s.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
