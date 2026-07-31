import { OWNERS } from '../lib/catalogs';

export default function Topbar({ ownerFilter, setOwnerFilter }) {
  const opts = [
    ['all', 'Tous', '#4B4767'],
    ['alex', 'Alex', OWNERS.alex.color],
    ['lea', 'Léa', OWNERS.lea.color],
    ['commun', 'Commun', OWNERS.commun.color],
  ];

  return (
    <header className="topbar">
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
    </header>
  );
}
