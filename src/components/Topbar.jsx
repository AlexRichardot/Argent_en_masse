import { useData } from '../context/DataContext';

export default function Topbar({ ownerFilter, setOwnerFilter }) {
  const { state } = useData();
  const profiles = state.profiles || [];

  return (
    <header className="topbar">
      <div className="owner-filter">
        <button className={ownerFilter === 'all' ? 'on' : ''}
          style={ownerFilter === 'all' ? { background: '#4B4767' } : {}}
          onClick={() => setOwnerFilter('all')}>
          Tous
        </button>
        {profiles.map((p) => (
          <button key={p.id} className={ownerFilter === p.id ? 'on' : ''}
            style={ownerFilter === p.id ? { background: p.color } : {}}
            onClick={() => setOwnerFilter(p.id)}>
            <span className="od" style={{ background: ownerFilter === p.id ? '#fff' : p.color }} />
            {p.name}
          </button>
        ))}
      </div>
    </header>
  );
}
