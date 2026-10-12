import { useEffect } from 'react';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', busy = false, onConfirm, onCancel }) {
  // Esc closes the dialog (keyboard friendly)
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);

  return (
    <div className="modal-backdrop">
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title">
        <h2 id="dlg-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel} disabled={busy} autoFocus>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
