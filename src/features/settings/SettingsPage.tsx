import { useStockitaStore, useStockitaData } from '../../store/useStockitaStore';

export default function SettingsPage() {
  const settings = useStockitaData().settings;
  const setTheme = useStockitaStore((state) => state.setTheme);

  return (
    <div className="page-shell">
      <div className="panel form-panel">
        <div className="section-title">Pengaturan</div>
        <div className="form-grid two-col">
          <label>
            Currency
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
      </div>
    </div>
  );
}
