import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/tokens.css';
import './index.css';
import { useStockitaStore } from './store/useStockitaStore';
import { onBroadcast } from './lib/sync';

function Bootstrap() {
  const initialize = useStockitaStore((s) => s.initialize);

  React.useEffect(() => {
    initialize();
    const off = onBroadcast(async (payload) => {
      if (payload?.type === 'invalidate') {
        // re-init from DB
        await initialize();
      }
    });
    return () => off();
  }, [initialize]);

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Bootstrap />
    </BrowserRouter>
  </React.StrictMode>
);
