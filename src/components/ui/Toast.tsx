import { useStockitaStore } from '../../store/useStockitaStore';

export function ToastContainer() {
  const toasts = useStockitaStore((s) => s.toasts);
  const removeToast = useStockitaStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <div className={`toast-dot dot-${toast.type}`} />
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Tutup notifikasi"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
