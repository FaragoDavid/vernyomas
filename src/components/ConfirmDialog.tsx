import { i18n } from '../i18n/hu';

interface DeleteConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ open, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: '24rem' }}>
        <h2 className="modal-title">{i18n.confirm.deleteTitle}</h2>
        <p className="text-sm text-cream-100 mb-6">{i18n.confirm.deleteMessage}</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn-secondary">
            {i18n.actions.cancel}
          </button>
          <button onClick={onConfirm} className="btn-primary" style={{ backgroundColor: 'var(--color-danger)' }}>
            {i18n.actions.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
