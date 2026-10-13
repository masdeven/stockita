import { formatCurrency, getInventoryStatus } from '../../lib/format';
import { useStockitaStore } from '../../store/useStockitaStore';

export function DashboardPage() {
  const products = useStockitaStore((state) => state.products);
  const transactions = useStockitaStore((state) => state.transactions);
  const loading = useStockitaStore((state) => state.loading);

  const productCount = products.length;
  const inventoryValue = products.reduce((sum, product) => sum + (product.stock > 0 ? product.stock * product.costPrice : 0), 0);
  const lowStockCount = products.filter((product) => getInventoryStatus(product).status === 'Rendah').length;
  const emptyStockCount = products.filter((product) => getInventoryStatus(product).status === 'Habis').length;
  const today = new Date();
  const todayTransactions = transactions.filter((transaction) => new Date(transaction.date).toDateString() === today.toDateString()).length;

  const lowList = products.filter((product) => getInventoryStatus(product).status !== 'Normal').slice(0, 4);
  const recent = [...transactions].sort((a, b) => b.date - a.date).slice(0, 5);

  if (loading) {
    return <div className="panel">Memuat dashboard…</div>;
  }

  return (
    <div className="page-shell">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Produk</div>
          <div className="stat-value">{productCount}</div>
          <div className="stat-meta">Master data aktif</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Nilai Stok</div>
          <div className="stat-value">{formatCurrency(inventoryValue)}</div>
          <div className="stat-meta">Berdasarkan harga beli saat ini</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Stok Rendah</div>
          <div className="stat-value">{lowStockCount}</div>
          <div className="stat-meta">{emptyStockCount} habis</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Transaksi Hari Ini</div>
          <div className="stat-value">{todayTransactions}</div>
          <div className="stat-meta">Tanggal lokal</div>
        </div>
      </div>

      <div className="content-grid">
        <section className="panel panel-wide">
          <div className="section-header">
            <div className="section-title">Pergerakan stok</div>
            <div className="segmented">
              <button className="segment active" type="button">7H</button>
              <button className="segment" type="button">30H</button>
              <button className="segment" type="button">90H</button>
            </div>
          </div>

          <div className="chart-box">
            <div className="chart-bars">
              {[42, 58, 35, 74, 90, 52, 84].map((value, index) => (
                <div key={index} className="chart-bar" style={{ height: `${value}%` }} />
              ))}
            </div>
          </div>
        </section>

        <aside className="panel">
          <div className="section-title">Stok rendah & habis</div>
          <div className="alert-list">
            {lowList.map((product) => {
              const status = getInventoryStatus(product);
              return (
                <div key={product.id} className={`alert-item ${status.status === 'Habis' ? 'danger' : ''}`}>
                  <div className="dot" />
                  <div>
                    <strong>{product.name}</strong>
                    <small>{status.stock} tersisa</small>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      <section className="panel">
        <div className="section-header">
          <div className="section-title">Transaksi terbaru</div>
          <button className="text-button" type="button">Lihat semua</button>
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
            {recent.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                <td>{tx.type}</td>
                <td>{tx.productNameSnapshot}</td>
                <td>{tx.qty > 0 ? `+${tx.qty}` : tx.qty}</td>
                <td>{tx.price ? formatCurrency(tx.price * Math.abs(tx.qty)) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default DashboardPage;
