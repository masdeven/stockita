import { useState } from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  requiredKeyword?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isDestructive = false,
  requiredKeyword
}: ConfirmDialogProps) {
  const [typedKeyword, setTypedKeyword] = useState('');

  const isConfirmDisabled = requiredKeyword ? typedKeyword !== requiredKeyword : false;

  const handleConfirm = () => {
    if (isConfirmDisabled) return;
    onConfirm();
    setTypedKeyword('');
    onClose();
  };

  const handleClose = () => {
    setTypedKeyword('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="sm">
      <div className="confirm-dialog-content">
        <p className="confirm-message">{message}</p>

        {requiredKeyword && (
          <div className="confirm-keyword-prompt">
            <label className="caption">
              Ketik <strong>{requiredKeyword}</strong> untuk melanjutkan:
            </label>
            <input
              type="text"
              value={typedKeyword}
              onChange={(e) => setTypedKeyword(e.target.value)}
              placeholder={requiredKeyword}
              autoFocus
              className="confirm-input"
            />
          </div>
        )}

        <div className="modal-actions">
          <button className="button secondary" onClick={handleClose}>
            {cancelText}
          </button>
          <button
            className={`button ${isDestructive ? 'danger' : 'primary'}`}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
