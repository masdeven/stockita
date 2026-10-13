import { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { useStockitaStore } from '../../store/useStockitaStore';
import { Calendar, AlertCircle, Check, RotateCcw } from 'lucide-react';

export function DateRangeModal() {
  const isOpen = useStockitaStore((s) => s.dateRangeModalOpen);
  const setIsOpen = useStockitaStore((s) => s.setDateRangeModalOpen);
  const customDateRange = useStockitaStore((s) => s.customDateRange);
  const setCustomDateRange = useStockitaStore((s) => s.setCustomDateRange);
  const setActivePeriod = useStockitaStore((s) => s.setActivePeriod);
  const addToast = useStockitaStore((s) => s.addToast);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (customDateRange) {
        setStartDate(customDateRange.startDate);
        setEndDate(customDateRange.endDate);
      } else {
        // Default: 14 hari terakhir sampai hari ini
        const d = new Date();
        d.setDate(d.getDate() - 13);
        setStartDate(d.toISOString().slice(0, 10));
        setEndDate(todayStr);
      }
      setError(null);
    }
  }, [isOpen, customDateRange, todayStr]);

  // Validasi real-time
  useEffect(() => {
    if (!startDate || !endDate) {
      setError('Silakan tentukan tanggal mulai dan tanggal akhir');
      return;
    }
    if (endDate < startDate) {
      setError('Tanggal akhir tidak boleh lebih awal dari tanggal mulai');
      return;
    }
    if (startDate > todayStr) {
      setError('Tanggal mulai tidak boleh melebihi hari ini');
      return;
    }
    setError(null);
  }, [startDate, endDate, todayStr]);

  const totalDays = useMemo(() => {
    if (!startDate || !endDate || endDate < startDate) return 0;
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const handleApplyPreset = (daysBack: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (daysBack - 1));
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
    setError(null);
  };

  const handleApplyThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(firstDay.toISOString().slice(0, 10));
    setEndDate(todayStr);
    setError(null);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (error || !startDate || !endDate) return;

    setCustomDateRange({ startDate, endDate });
    setIsOpen(false);
    addToast(`Rentang tanggal diterapkan (${totalDays} hari: ${startDate} s/d ${endDate})`, 'success');
  };

  const handleResetToPreset = () => {
    setActivePeriod('7H');
    setIsOpen(false);
    addToast('Kembali ke rentang default 7 Hari', 'info');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Pilih Rentang Tanggal Grafik"
      maxWidth="sm"
    >
      <form onSubmit={handleApply} className="date-range-modal-content">
        <p className="caption modal-desc">
          Tentukan rentang tanggal khusus untuk memfilter pergerakan stok masuk dan keluar pada grafik.
        </p>

        {/* Quick Presets */}
        <div className="date-range-shortcuts">
          <span className="overline">Pilihan Cepat:</span>
          <div className="shortcuts-chips">
            <button
              type="button"
              className="shortcut-chip"
              onClick={() => handleApplyPreset(7)}
            >
              7 Hari
            </button>
            <button
              type="button"
              className="shortcut-chip"
              onClick={() => handleApplyPreset(14)}
            >
              14 Hari
            </button>
            <button
              type="button"
              className="shortcut-chip"
              onClick={() => handleApplyPreset(30)}
            >
              30 Hari
            </button>
            <button
              type="button"
              className="shortcut-chip"
              onClick={handleApplyThisMonth}
            >
              Bulan Ini
            </button>
          </div>
        </div>

        {/* Inputs Pair */}
        <div className="date-range-inputs-grid">
          <div className="form-field">
            <label className="field-label" htmlFor="custom-start-date">
              Tanggal Mulai
            </label>
            <input
              id="custom-start-date"
              type="date"
              value={startDate}
              max={todayStr}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="custom-end-date">
              Tanggal Akhir
            </label>
            <input
              id="custom-end-date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              max={todayStr}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Info or Error Banner */}
        {error ? (
          <div className="modal-validation-alert error">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : totalDays > 0 ? (
          <div className="modal-validation-alert info">
            <Calendar size={14} className="flex-shrink-0" />
            <span>
              Total <strong>{totalDays} hari</strong> ({startDate} s/d {endDate})
            </span>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="modal-actions-footer">
          {customDateRange && (
            <button
              type="button"
              className="button button-secondary reset-to-preset-btn"
              onClick={handleResetToPreset}
              title="Reset dan gunakan preset period standar"
            >
              <RotateCcw size={13} />
              <span>Reset Preset</span>
            </button>
          )}

          <div className="footer-right-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setIsOpen(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="button cta"
              disabled={Boolean(error) || !startDate || !endDate}
            >
              <Check size={14} />
              <span>Terapkan</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
