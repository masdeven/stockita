import { useState } from 'react';
import { useStockitaStore } from '../../store/useStockitaStore';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Truck, Box } from 'lucide-react';
import type { Supplier } from '../../types';

export function SuppliersPage() {
  const suppliers = useStockitaStore((s) => s.suppliers);
  const products = useStockitaStore((s) => s.products);
  const addSupplier = useStockitaStore((s) => s.addSupplier);
  const updateSupplier = useStockitaStore((s) => s.updateSupplier);
  const deleteSupplier = useStockitaStore((s) => s.deleteSupplier);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [nameError, setNameError] = useState('');

  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const openAddModal = () => {
    setEditingSupplier(null);
    setName('');
    setContact('');
    setAddress('');
    setNote('');
    setNameError('');
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setContact(sup.contact || '');
    setAddress(sup.address || '');
    setNote(sup.note || '');
    setNameError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Nama supplier wajib diisi');
      return;
    }

    try {
      if (editingSupplier) {
        await updateSupplier({
          ...editingSupplier,
          name: name.trim(),
          contact: contact.trim() || undefined,
          address: address.trim() || undefined,
          note: note.trim() || undefined,
          updatedAt: Date.now()
        });
      } else {
        await addSupplier({
          id: crypto.randomUUID(),
          name: name.trim(),
          contact: contact.trim() || undefined,
          address: address.trim() || undefined,
          note: note.trim() || undefined,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      // handled by store toast
    }
  };

  const linkedCount = supplierToDelete
    ? products.filter((p) => p.supplierId === supplierToDelete.id).length
    : 0;

  return (
    <div className="page-shell">
      <div className="toolbar-section">
        <div className="toolbar-title-row">
          <div>
            <h1 className="title-section">Master Data Supplier</h1>
            <div className="caption">Daftar pemasok barang dan mitra pengadaan stok</div>
          </div>
          <button className="button primary" onClick={openAddModal}>
            <Plus size={16} /> + Tambah Supplier
          </button>
        </div>
      </div>

      <div className="panel panel-table">
        {suppliers.length === 0 ? (
          <div className="empty-state-card">
            <Truck size={36} className="text-disabled" />
            <div className="empty-title">Belum ada supplier</div>
            <p className="empty-desc">Catat kontak dan data vendor pemasok barang Anda di sini.</p>
            <button className="button primary" onClick={openAddModal}>
              <Plus size={16} /> Tambah Supplier
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Supplier</th>
                  <th>Kontak / Telp</th>
                  <th>Alamat</th>
                  <th>Catatan</th>
                  <th className="text-right">Produk Terkait</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup) => {
                  const count = products.filter((p) => p.supplierId === sup.id).length;

                  return (
                    <tr key={sup.id}>
                      <td>
                        <strong>{sup.name}</strong>
                      </td>
                      <td>{sup.contact || '—'}</td>
                      <td>{sup.address || '—'}</td>
                      <td className="cell-note">{sup.note || '—'}</td>
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
                            onClick={() => openEditModal(sup)}
                            title="Edit supplier"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="icon-button icon-button-danger"
                            onClick={() => setSupplierToDelete(sup)}
                            title="Hapus supplier"
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

      {/* Modal Tambah / Edit Supplier */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="form-modal-wrap">
          <label>
            Nama Supplier / Distributor*
            <input
              type="text"
              placeholder="mis. PT Sumber Pangan Makmur"
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
            Kontak (No. HP / Email / PIC)
            <input
              type="text"
              placeholder="mis. 0812-3456-7890 (Budi)"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </label>

          <label>
            Alamat Gudang / Kantor
            <input
              type="text"
              placeholder="mis. Jl. Industri No. 12, Surabaya"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>

          <label>
            Catatan Tambahan
            <textarea
              placeholder="Ketentuan pembayaran, tempo PO, rekening bank, dll…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="button primary">
              {editingSupplier ? 'Simpan Perubahan' : 'Tambah Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Supplier Dialog */}
      <ConfirmDialog
        isOpen={supplierToDelete != null}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={() => {
          if (supplierToDelete) {
            deleteSupplier(supplierToDelete.id);
            setSupplierToDelete(null);
          }
        }}
        title="Hapus Supplier"
        message={
          linkedCount > 0
            ? `Supplier "${supplierToDelete?.name}" saat ini dikaitkan dengan ${linkedCount} produk. Menghapus supplier ini tidak akan menghapus produk atau transaksi terdahulu, tetapi field supplier pada produk terkait akan dikosongkan. Lanjutkan?`
            : `Apakah Anda yakin ingin menghapus supplier "${supplierToDelete?.name}"?`
        }
        confirmText="Hapus & Unlink"
        cancelText="Batal"
        isDestructive={true}
      />
    </div>
  );
}
