import { OWNERS } from '../lib/catalogs';
import { useData } from '../context/DataContext';

export default function Topbar({ ownerFilter, setOwnerFilter }) {
  const { syncStatus } = useData();
  const opts = [
    ['all', 'Tous', '#4B4767'],
    ['alex', 'Alex', OWNERS.alex.color],
    ['lea', 'Léa', OWNERS.lea.color],
    ['commun', 'Commun', OWNERS.commun.color],
  ];
  const statusLabel = { ok: 'Synchronisé', pending: 'Synchronisation…', error: 'Erreur de synchro', idle: '—' }[syncStatus] || '—';
  const statusClass = { ok: 'ok', pending: 'pending', error: 'err' }[syncStatus] || '';

  return (
    <header className="topbar">
      <div className="greet">
        <h2>Bonjour&nbsp;👋</h2>
        <p>Voici l'état de votre patrimoine aujourd'hui.</p>
      </div>
      <div className="owner-filter">
        {opts.map(([key, label, color]) => (
          <button key={key} className={ownerFilter === key ? 'on' : ''}
            style={ownerFilter === key ? { background: color } : {}}
            onClick={() => setOwnerFilter(key)}>
            {key !== 'all' && <span className="od" style={{ background: ownerFilter === key ? '#fff' : color }} />}
            {label}
          </button>
        ))}
      </div>
      <button className="sync-pill" title="Statut de synchronisation">
        <span className={`sync-dot ${statusClass}`} />
        <span>{statusLabel}</span>
      </button>
    </header>
  );
}
