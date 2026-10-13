import { useEffect, useState } from 'react';
import { useStockitaStore } from '../../store/useStockitaStore';
import type { Category } from '../../types';
import { createCategory, updateCategory, deleteCategory } from '../../db/repositories/categories';

const empty: Partial<Category> = { name: '', description: '', color: 'accent' };

export function CategoryPage() {
  const categories = useStockitaStore((s) => s.categories);
  const initialize = useStockitaStore((s) => s.initialize);
  const [form, setForm] = useState<Partial<Category>>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSave = async () => {
    if (!form.name || !form.name.trim()) {
      alert('Nama kategori wajib.');
      return;
    }

    setLoading(true);
    try {
      const payload: Category = {
        id: editingId ?? crypto.randomUUID(),
        name: form.name.trim(),
        description: form.description || '',
        color: (form.color as Category['color']) || 'accent',
        createdAt: editingId ? categories.find((item) => item.id === editingId)?.createdAt ?? Date.now() : Date.now(),
        updatedAt: Date.now()
      };

      if (editingId) {
        await updateCategory(payload);
      } else {
        await createCategory(payload);
      }

      await initialize();
      setForm(empty);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ ...cat });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori? Produk yang memakai kategori ini akan kehilangan relasi kategori.')) {
      return;
    }

    setLoading(true);
    try {
      await deleteCategory(id);
      await initialize();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus kategori');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="panel form-panel">
        <div className="section-title">Kategori</div>
        <div className="form-grid">
          <label>
            Nama
            <input value={form.name ?? ''} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
          </label>
          <label>
            Deskripsi
            <input value={form.description ?? ''} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
          </label>
          <label>
            Warna badge
            <select value={form.color ?? 'accent'} onChange={(e) => setForm((current) => ({ ...current, color: e.target.value as Category['color'] }))}>
              <option value="accent">Accent</option>
              <option value="positive">Positive</option>
              <option value="warning">Warning</option>
              <option value="negative">Negative</option>
              <option value="subtle">Subtle</option>
            </select>
          </label>
        </div>
        <div className="actions-row">
          <button className="button primary" onClick={handleSave} disabled={loading}>
            {editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}
          </button>
          <button className="button secondary" onClick={() => { setForm(empty); setEditingId(null); }} disabled={loading}>
            Batal
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="section-header">
          <div className="section-title">Daftar Kategori</div>
          <span className="badge neutral">{categories.length} item</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Deskripsi</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>{cat.description}</td>
                <td>
                  <button className="button secondary" onClick={() => handleEdit(cat)}>Edit</button>
                  <button className="button" style={{ marginLeft: 8 }} onClick={() => handleDelete(cat.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CategoryPage;
