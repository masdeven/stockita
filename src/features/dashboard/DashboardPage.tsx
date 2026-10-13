import { useEffect } from 'react';
import { BarChart3, Boxes, Package2, Settings, TrendingUp } from 'lucide-react';
import { useStockitaMetrics } from '../store/useStockitaStore';
import { formatCurrency } from '../lib/format';

function StatCard({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-meta">{meta}</div>
    </div>
  );
}

export default function DashboardPage() {
  const metrics = useStockitaMetrics();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
  }, []);

  const recentTransactions = [
    { id: 1, type: 'Stok Masuk', product: 'Laptop Mini', qty: '+10', value: 'Rp 82.000.000' },
    { id: 2, type: 'Stok Keluar', product: 'Monitor 24"', qty: '-3', value: 'Rp 7.800.000' },
    { id: 3, type: 'Penyesuaian', product: 'Laptop Mini', qty: '+2', value: '—' }
  ];

  return (
    <div className="page-shell">
      <div className="stats-grid">
        <StatCard label="Total Produk" value={String(metrics.productCount)} meta="Master data aktif" />
        <StatCard label="Nilai Stok" value={metrics.stockValueText} meta="Berdasarkan harga beli saat ini" />
        <StatCard label="Stok Rendah" value={String(metrics.lowStockCount)} meta={`${metrics.emptyStockCount} habis`} />
        <StatCard label="Transaksi Hari Ini" value={String(metrics.todayTransactions)} meta="Tanggal lokal" />
      </div>

      <div className="content-grid">
        <section className="panel panel--wide">
          <div className="section-header">
            <div className="section-title">Pergerakan stok</div>
            <div className="segmented">
              <button className="segment active">7H</button>
              <button className="segment">30H</button>
              <button className="segment">90H</button>
            </div>
          </div>

          <div className="chart-box">
            <div className="chart-bars">
              {[42, 58, 35, 74, 90, 52, 84].map((item, index) => (
                <div key={index} className="chart-bar" style={{ height: `${item}%` }} />
              ))}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="section-title">Stok rendah & habis</div>
          <div className="alert-list">
            <div className="alert-item">
              <Boxes size={16} />
              <div>
                <strong>Monitor 24&quot;</strong>
                <small>2 tersisa</small>
              </div>
            </div>
            <div className="alert-item danger">
              <Package2 size={16} />
              <div>
                <strong>Keyboard Pro</strong>
                <small>0 tersisa</small>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="panel">
        <div className="section-header">
          <div className="section-title">Transaksi terbaru</div>
          <button className="text-button">Lihat semua</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Tipe</th>
              <th>Produk</th>
              <th>Qty</th>
              <th>Nilai</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((row) => (
              <tr key={row.id}>
                <td>13 Okt</td>
                <td>{row.type}</td>
                <td>{row.product}</td>
                <td>{row.qty}</td>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
