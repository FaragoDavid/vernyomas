interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: '24rem' }}>
        <h2 className="modal-title">{title}</h2>
        <p className="text-sm text-cream-100 mb-6">{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn-secondary">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="btn-primary" style={isDangerous ? { backgroundColor: 'var(--color-accent)' } : undefined}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
