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
        <h2 className="modal-title">Mérés törlése</h2>
        <p className="text-sm text-cream-100 mb-6">Biztos vagy, hogy szeretnéd törölni ezt a mérést?</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn-secondary">
            Mégse
          </button>
          <button onClick={onConfirm} className="btn-primary" style={{ backgroundColor: 'var(--color-accent)' }}>
            Törlés
          </button>
        </div>
      </div>
    </div>
  );
}
