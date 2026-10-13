import { useState, useEffect } from 'react';
import { useStockitaStore } from '../../store/useStockitaStore';
import { exportBackup, importBackup, validateBackup, type BackupPreview } from '../../db/backup';
import { saveAs } from '../../lib/saveAs';
import { parseCSVSafe } from '../../lib/export';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import {
  Settings,
  Store,
  Sliders,
  Database,
  Download,
  Upload,
  Trash2,
  FileSpreadsheet,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { AppSettings, ThemeMode } from '../../types';

export function SettingsPage() {
  const settings = useStockitaStore((s) => s.settings);
  const setSettings = useStockitaStore((s) => s.setSettings);
  const setTheme = useStockitaStore((s) => s.setTheme);
  const products = useStockitaStore((s) => s.products);
  const transactions = useStockitaStore((s) => s.transactions);
  const categories = useStockitaStore((s) => s.categories);
  const suppliers = useStockitaStore((s) => s.suppliers);
  const addToast = useStockitaStore((s) => s.addToast);
  const resetAllData = useStockitaStore((s) => s.resetAllData);
  const initialize = useStockitaStore((s) => s.initialize);

  // Profile Form
  const [storeName, setStoreName] = useState(settings.profile?.storeName || '');
  const [address, setAddress] = useState(settings.profile?.address || '');
  const [contact, setContact] = useState(settings.profile?.contact || '');

  // Preferences Form
  const [themeMode, setThemeMode] = useState<ThemeMode>(settings.theme || 'light');
  const [dateFormat, setDateFormat] = useState<AppSettings['dateFormat']>(settings.dateFormat || 'locale');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(settings.lowStockThreshold || 3);

  // Storage estimation
  const [storageEstimate, setStorageEstimate] = useState<string>('Menghitung…');

  // Import Modal & State
  const [importPreview, setImportPreview] = useState<BackupPreview | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Reset dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    if (settings.profile) {
      setStoreName(settings.profile.storeName || '');
      setAddress(settings.profile.address || '');
      setContact(settings.profile.contact || '');
    }
    setThemeMode(settings.theme || 'light');
    setDateFormat(settings.dateFormat || 'locale');
    setLowStockThreshold(settings.lowStockThreshold || 3);
  }, [settings]);

  // Check storage quota
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.usage != null) {
          const kb = (est.usage / 1024).toFixed(1);
          const quotaMb = est.quota ? (est.quota / (1024 * 1024)).toFixed(0) : '—';
          setStorageEstimate(`${kb} KB terpakai (Kuota perkiraan: ~${quotaMb} MB)`);
        } else {
          setStorageEstimate('Tersedia (Estimasi tidak dilaporkan)');
        }
      }).catch(() => {
        setStorageEstimate('Tersedia');
      });
    } else {
      setStorageEstimate('Tidak didukung browser ini');
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      profile: {
        storeName: storeName.trim(),
        address: address.trim() || undefined,
        contact: contact.trim() || undefined
      }
    });
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      theme: themeMode,
      dateFormat,
      lowStockThreshold: Number(lowStockThreshold) || 3
    });
  };

  const handleExportJSON = async () => {
    try {
      const json = await exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const filename = `stockita-backup-${new Date().toISOString().slice(0, 10)}.json`;
      saveAs(blob, filename);
      addToast('Backup JSON lengkap berhasil diunduh', 'success');
    } catch (err) {
      addToast('Gagal mengekspor backup', 'error');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        addToast('Format file bukan JSON yang valid', 'error');
        return;
      }

      const preview = validateBackup(parsed);
      if (!preview.valid) {
        addToast(`File backup tidak valid: ${preview.reason}`, 'error');
        return;
      }

      setImportPreview(preview);
      setIsImportModalOpen(true);
    } catch (err: any) {
      addToast(err?.message || 'Gagal membaca file', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview?.payload) return;
    setIsImporting(true);

    try {
      const result = await importBackup(importPreview.payload);
      if (!result.ok) {
        throw new Error(result.reason || 'Import gagal');
      }

      await initialize();
      setIsImportModalOpen(false);
      setImportPreview(null);
      addToast('Seluruh data berhasil dipulihkan dari backup!', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Gagal memulihkan backup', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportProductsCSV = () => {
    if (products.length === 0) {
      addToast('Tidak ada data produk untuk diekspor', 'error');
      return;
    }
    const headers = ['SKU', 'Nama Produk', 'Satuan', 'Stok', 'Stok Minimum', 'Harga Beli', 'Harga Jual', 'Lokasi'];
    const rows = products.map((p) => [p.sku, p.name, p.unit, p.stock, p.minStock, p.costPrice, p.sellPrice, p.location || '']);
    const csv = parseCSVSafe([headers, ...rows]);
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `stockita-semua-produk-${new Date().toISOString().slice(0, 10)}.csv`);
    addToast('CSV Produk berhasil diunduh', 'success');
  };

  const handleExportTransactionsCSV = () => {
    if (transactions.length === 0) {
      addToast('Tidak ada data transaksi untuk diekspor', 'error');
      return;
    }
    const headers = ['ID', 'Tanggal', 'Tipe', 'SKU', 'Nama Produk', 'Qty', 'Sebelum', 'Setelah', 'Harga', 'Alasan', 'Catatan'];
    const rows = transactions.map((t) => [
      t.id,
      new Date(t.date).toLocaleDateString('id-ID'),
      t.type,
      t.productSkuSnapshot,
      t.productNameSnapshot,
      t.type === 'in' ? `+${t.qty}` : t.type === 'out' ? `-${Math.abs(t.qty)}` : t.qty,
      t.stockBefore,
      t.stockAfter,
      t.price || '',
      t.reason || '',
      t.note || ''
    ]);
    const csv = parseCSVSafe([headers, ...rows]);
    saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `stockita-semua-transaksi-${new Date().toISOString().slice(0, 10)}.csv`);
    addToast('CSV Transaksi berhasil diunduh', 'success');
  };

  return (
    <div className="page-shell">
      <div className="toolbar-section">
        <h1 className="title-section">Pengaturan & Manajemen Data</h1>
        <div className="caption">Kelola profil toko, preferensi antarmuka, dan pemulihan data inventori</div>
      </div>

      <div className="settings-grid-layout">
        {/* Section 1: Profil Toko */}
        <div className="panel settings-card">
          <div className="section-header">
            <div className="section-title-wrap">
              <Store size={18} />
              <div className="section-title">Profil Toko</div>
            </div>
          </div>
          <form onSubmit={handleSaveProfile} className="form-grid">
            <label>
              Nama Usaha / Toko
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="mis. Toko Kopi Sejahtera"
              />
            </label>
            <label>
              Kontak / WhatsApp
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="mis. 0812-3456-7890"
              />
            </label>
            <label className="full-width">
              Alamat Toko / Gudang
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat fisik untuk kop laporan…"
                rows={2}
              />
            </label>
            <div className="full-width text-right">
              <button type="submit" className="button primary">
                Simpan Profil Toko
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Preferensi Tampilan */}
        <div className="panel settings-card">
          <div className="section-header">
            <div className="section-title-wrap">
              <Sliders size={18} />
              <div className="section-title">Preferensi Tampilan</div>
            </div>
          </div>
          <form onSubmit={handleSavePreferences} className="form-grid">
            <label>
              Tema Antarmuka
              <select
                value={themeMode}
                onChange={(e) => {
                  const val = e.target.value as ThemeMode;
                  setThemeMode(val);
                  setTheme(val);
                }}
              >
                <option value="light">Terang (Terminal Terang - Default)</option>
                <option value="dark">Gelap (Dark Mode)</option>
                <option value="system">Mengikuti Sistem Komputer</option>
              </select>
            </label>

            <label>
              Format Tampilan Tanggal
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as any)}
              >
                <option value="locale">Locale Indonesia (13 Okt 2026)</option>
                <option value="dd/MM/yyyy">dd/MM/yyyy (13/10/2026)</option>
                <option value="yyyy-MM-dd">yyyy-MM-dd (2026-10-13)</option>
              </select>
            </label>

            <label>
              Default Ambang Stok Rendah
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              />
              <span className="caption">Digunakan sebagai acuan awal produk baru</span>
            </label>

            <label>
              Mata Uang Default
              <input type="text" value="IDR (Rupiah)" disabled />
            </label>

            <div className="full-width text-right">
              <button type="submit" className="button primary">
                Simpan Preferensi
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Data Portability & Backup */}
        <div className="panel settings-card">
          <div className="section-header">
            <div className="section-title-wrap">
              <Database size={18} />
              <div className="section-title">Cadangan & Portabilitas Data</div>
            </div>
          </div>
          <p className="caption">
            Seluruh data operasional Anda tersimpan secara lokal di browser ini. Unduh file cadangan secara berkala
            untuk keamanan atau saat ingin memindahkan data ke perangkat lain.
          </p>

          <div className="backup-action-grid">
            <div className="backup-item-box">
              <strong>Export Backup Lengkap (JSON)</strong>
              <p className="caption">Mencakup semua master produk, kategori, supplier, transaksi, dan pengaturan.</p>
              <button className="button primary cta" onClick={handleExportJSON}>
                <Download size={14} /> Unduh File Backup (.json)
              </button>
            </div>

            <div className="backup-item-box">
              <strong>Pulihkan Cadangan (Import JSON)</strong>
              <p className="caption">Menggantikan data yang ada dengan data cadangan yang valid.</p>
              <label className="button secondary file-upload-btn">
                <Upload size={14} /> Pilih File Backup JSON…
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="backup-item-box">
              <strong>Ekspor Tabel ke Spreadsheet (CSV)</strong>
              <p className="caption">Format CSV bersih tanpa formula injection untuk analisis di Excel/Sheets.</p>
              <div className="button-group-sm">
                <button className="button secondary" onClick={handleExportProductsCSV}>
                  <FileSpreadsheet size={14} /> Export Produk CSV
                </button>
                <button className="button secondary" onClick={handleExportTransactionsCSV}>
                  <FileSpreadsheet size={14} /> Export Transaksi CSV
                </button>
              </div>
            </div>

            <div className="backup-item-box danger-box">
              <strong className="text-neg">Reset Data Inventori</strong>
              <p className="caption">Hapus seluruh isi inventori dan transaksi lokal. Tidak dapat dibatalkan.</p>
              <button
                className="button danger"
                onClick={() => setResetDialogOpen(true)}
              >
                <Trash2 size={14} /> Reset Seluruh Data…
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Informasi & Status Penyimpanan */}
        <div className="panel settings-card">
          <div className="section-header">
            <div className="section-title-wrap">
              <Info size={18} />
              <div className="section-title">Tentang Stockita & Status Sistem</div>
            </div>
          </div>
          <div className="info-list">
            <div className="info-row">
              <span className="caption">Versi Aplikasi</span>
              <strong className="data">Stockita v1.2 (Client-Side Only)</strong>
            </div>
            <div className="info-row">
              <span className="caption">Status Penyimpanan IndexedDB</span>
              <span className="badge-status-pos">
                <CheckCircle2 size={14} /> Tersambung & Aktif (Dexie 4.x)
              </span>
            </div>
            <div className="info-row">
              <span className="caption">Penggunaan Penyimpanan Browser</span>
              <span className="data font-mono">{storageEstimate}</span>
            </div>
            <div className="info-row">
              <span className="caption">Ringkasan Entitas Aktif</span>
              <span className="data">
                {products.length} Produk · {categories.length} Kategori · {suppliers.length} Supplier · {transactions.length} Transaksi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Preview Import JSON */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Konfirmasi Pemulihan Data (Replace All)"
        maxWidth="md"
      >
        {importPreview && importPreview.counts && (
          <div className="import-preview-wrap">
            <div className="alert-banner-warning">
              <AlertCircle size={20} />
              <div>
                <strong>PERHATIAN: Mode Replace All</strong>
                <p>
                  Memulihkan file ini akan menimpa seluruh data produk, transaksi, kategori, dan supplier saat ini
                  dengan data yang terdapat pada file backup.
                </p>
              </div>
            </div>

            <div className="preview-stat-summary">
              <div className="caption">Ringkasan Data dalam File Backup:</div>
              <div className="preview-counts-grid">
                <div className="count-pill">
                  <span className="caption">Produk</span>
                  <strong>{importPreview.counts.products}</strong>
                </div>
                <div className="count-pill">
                  <span className="caption">Kategori</span>
                  <strong>{importPreview.counts.categories}</strong>
                </div>
                <div className="count-pill">
                  <span className="caption">Supplier</span>
                  <strong>{importPreview.counts.suppliers}</strong>
                </div>
                <div className="count-pill">
                  <span className="caption">Transaksi</span>
                  <strong>{importPreview.counts.transactions}</strong>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => setIsImportModalOpen(false)}
                disabled={isImporting}
              >
                Batal
              </button>
              <button
                type="button"
                className="button primary danger-btn"
                onClick={handleConfirmImport}
                disabled={isImporting}
              >
                {isImporting ? 'Memproses Impor…' : 'Ganti & Pulihkan Sekarang'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={resetAllData}
        title="Reset Seluruh Data"
        message="PERINGATAN: Tindakan ini akan menghapus seluruh master produk, transaksi, kategori, dan supplier secara permanen dari browser ini."
        confirmText="Hapus Semua Data"
        cancelText="Batal"
        isDestructive={true}
        requiredKeyword="HAPUS"
      />
    </div>
  );
}
