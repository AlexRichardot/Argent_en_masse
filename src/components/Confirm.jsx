export default function Confirm({ title, message, onConfirm, onCancel, confirmLabel = 'Supprimer' }) {
  return (
    <div className="overlay on" style={{ position: 'fixed' }} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal" style={{ color: 'var(--ink)' }}>
        <h2>{title}</h2>
        {message && <p className="lead">{message}</p>}
        <div className="foot">
          <button className="btn primary" style={{ background: 'var(--rose)', boxShadow: 'none' }} onClick={onConfirm}>{confirmLabel}</button>
          <button className="btn ghost" onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
}
