import { useState } from 'react';
import { useStockitaStore } from '../../store/useStockitaStore';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Tags, Box } from 'lucide-react';
import type { Category, TokenColor } from '../../types';

const colorOptions: { value: TokenColor; label: string; class: string }[] = [
  { value: 'accent', label: 'Biru Aksen', class: 'chip-accent' },
  { value: 'positive', label: 'Hijau Positif', class: 'chip-pos' },
  { value: 'warning', label: 'Oranye Warning', class: 'chip-warn' },
  { value: 'negative', label: 'Merah Bahaya', class: 'chip-neg' },
  { value: 'subtle', label: 'Abu Netral', class: 'chip-neutral' }
];

export function CategoriesPage() {
  const categories = useStockitaStore((s) => s.categories);
  const products = useStockitaStore((s) => s.products);
  const addCategory = useStockitaStore((s) => s.addCategory);
  const updateCategory = useStockitaStore((s) => s.updateCategory);
  const deleteCategory = useStockitaStore((s) => s.deleteCategory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<TokenColor>('accent');
  const [nameError, setNameError] = useState('');

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor('accent');
    setNameError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color || 'accent');
    setNameError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Nama kategori wajib diisi');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({
          ...editingCategory,
          name: name.trim(),
          description: description.trim() || undefined,
          color,
          updatedAt: Date.now()
        });
      } else {
        await addCategory({
          id: crypto.randomUUID(),
          name: name.trim(),
          description: description.trim() || undefined,
          color,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      // handled by store toast
    }
  };

  const linkedCount = categoryToDelete
    ? products.filter((p) => p.categoryId === categoryToDelete.id).length
    : 0;

  return (
    <div className="page-shell">
      <div className="toolbar-section">
        <div className="toolbar-title-row">
          <div>
            <h1 className="title-section">Master Data Kategori</h1>
            <div className="caption">Kelompokkan produk inventori untuk pengorganisasian yang rapi</div>
          </div>
          <button className="button primary" onClick={openAddModal}>
            <Plus size={16} /> Tambah Kategori
          </button>
        </div>
      </div>

      <div className="panel panel-table">
        {categories.length === 0 ? (
          <div className="empty-state-card">
            <Tags size={36} className="text-disabled" />
            <div className="empty-title">Belum ada kategori</div>
            <p className="empty-desc">Tambahkan kategori produk pertama Anda untuk mempermudah filter dan laporan.</p>
            <button className="button primary" onClick={openAddModal}>
              <Plus size={16} /> Tambah Kategori
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Kategori</th>
                  <th>Badge Warna</th>
                  <th>Deskripsi</th>
                  <th className="text-right">Produk Terkait</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.categoryId === cat.id).length;
                  const colorConfig = colorOptions.find((c) => c.value === cat.color) || colorOptions[0];

                  return (
                    <tr key={cat.id}>
                      <td>
                        <strong>{cat.name}</strong>
                      </td>
                      <td>
                        <span className={`chip chip-xs ${colorConfig.class}`}>
                          {colorConfig.label}
                        </span>
                      </td>
                      <td className="cell-note">{cat.description || '—'}</td>
                      <td className="text-right tabular-nums">
                        {count > 0 ? (
                          <span className="badge-count">
                            <Box size={12} /> {count} produk
                          </span>
                        ) : (
                          <span className="caption">0 produk</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            onClick={() => openEditModal(cat)}
                            title="Edit kategori"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="icon-button icon-button-danger"
                            onClick={() => setCategoryToDelete(cat)}
                            title="Hapus kategori"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Kategori */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="form-modal-wrap">
          <label>
            Nama Kategori*
            <input
              type="text"
              placeholder="mis. Makanan & Minuman, Aksesoris"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError('');
              }}
              autoFocus
              className={nameError ? 'input-error' : ''}
            />
            {nameError && <span className="field-error">{nameError}</span>}
          </label>

          <label>
            Warna Tanda / Badge
            <select value={color} onChange={(e) => setColor(e.target.value as TokenColor)}>
              {colorOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Deskripsi (Opsional)
            <textarea
              placeholder="Keterangan singkat tentang grup kategori ini…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="button primary">
              {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Category Dialog */}
      <ConfirmDialog
        isOpen={categoryToDelete != null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
          }
        }}
        title="Hapus Kategori"
        message={
          linkedCount > 0
            ? `Kategori "${categoryToDelete?.name}" saat ini digunakan oleh ${linkedCount} produk. Menghapus kategori ini tidak akan menghapus produk, tetapi relasi kategori pada ${linkedCount} produk terkait akan diubah menjadi kosong (—). Lanjutkan?`
            : `Apakah Anda yakin ingin menghapus kategori "${categoryToDelete?.name}"?`
        }
        confirmText="Hapus & Unlink"
        cancelText="Batal"
        isDestructive={true}
      />
    </div>
  );
}
