# Stockita

Stockita — client-side inventory PWA (work-in-progress).

Clone and run

```bash
git clone https://github.com/masdeven/stockita.git
cd stockita
npm install
npm run dev
```

What I implemented so far

- React + Vite + TypeScript scaffold
- UI shell and pages: Dashboard, Produk, Transaksi, Pengaturan
- Dexie DB schema and seed data
- Zustand store wired to Dexie for initialization
- Basic forms and tables for products and transactions
- Design tokens (tokens.css) derived from DESIGN.md

Next steps I'll complete in the repo (already in progress):
- Atomic transaction handling when writing transactions and updating product stock
- Backup (export/import JSON) with validation and Replace All flow
- CSV export with formula neutralization
- BroadcastChannel sync across tabs
- Utilities: uuid fallback, pure inventory calculations

If you clone and run now, UI will work with demo seed data. I'll continue pushing the remaining modules so you can clone and run a more complete implementation.
