import { exportBackup, importBackup } from '../../db/backup';
import { useStockitaStore } from '../../store/useStockitaStore';
import { saveAs } from '../../lib/saveAs';
import { parseCSVSafe } from '../../lib/export';

export function SettingsPage() {
  const settings = useStockitaStore((s) => s.settings);
  const setTheme = useStockitaStore((s) => s.setTheme);

  const onExportJSON = async () => {
    try {
      const json = await exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      saveAs(blob, `stockita-backup-${new Date().toISOString().slice(0,10)}.json`);
    } catch (err) {
      alert('Gagal mengekspor backup');
    }
  };

  const onImportJSON = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await importBackup(parsed);
      if (!res.ok) alert(`Import gagal: ${res.reason}`);
      else alert('Import berhasil. Aplikasi akan memuat ulang data.');
      // re-init store
      await useStockitaStore.getState().initialize();
    } catch (err: any) {
      alert('File import tidak valid: ' + (err?.message || ''));
    }
  };

  const onExportCSVProducts = async () => {
    const products = useStockitaStore.getState().products;
    const headers = ['SKU','Nama','Kategori','Supplier','Satuan','Stok','Stok Minimum','Harga Beli','Harga Jual','Lokasi','Catatan','createdAt','updatedAt'];
    const rows = products.map(p => [p.sku, p.name, p.categoryId || '', p.supplierId || '', p.unit, String(p.stock), String(p.minStock), String(p.costPrice), String(p.sellPrice), p.location || '', (p.note||'').replace(/\n/g,' '), String(p.createdAt), String(p.updatedAt)]);
    const csv = parseCSVSafe([headers, ...rows]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `stockita-products-${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="page-shell">
      <div className="panel form-panel">
        <div className="section-title">Pengaturan</div>
        <div className="form-grid two-col">
          <label>
            Mata uang
            <input value={settings.currency} readOnly />
          </label>
          <label>
            Tema
            <select value={settings.theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>
        </div>

        <div style={{ marginTop: 18 }}>
          <button className="button primary" onClick={onExportJSON}>Export JSON (backup)</button>
          <label style={{ marginLeft: 8 }} className="button secondary">
            Import JSON
            <input style={{ display: 'none' }} type="file" accept="application/json" onChange={(e) => onImportJSON(e.target.files ? e.target.files[0] : null)} />
          </label>
          <button className="button secondary" style={{ marginLeft: 8 }} onClick={onExportCSVProducts}>Export CSV Produk</button>
        </div>
      </div>
    </div>
  );
}
