import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const NAV = [
  { key: 'overview', label: "Vue d'ensemble" },
  { key: 'flow', label: 'Revenus & dépenses' },
  { key: 'wealth', label: 'Épargne & patrimoine' },
  { key: 'projects', label: 'Projets & échéances' },
  { key: 'reco', label: 'Recommandations' },
];

export default function Sidebar({ tab, setTab }) {
  const { signOut } = useAuth();
  const { flush } = useData();

  async function handleLogout() {
    if (!confirm('Se déconnecter ? Vos données restent en ligne sur votre compte.')) return;
    await flush();
    await signOut();
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="mk"><div className="d" /></div>
        <b>Patrimoine</b>
      </div>
      <div className="menu-lbl">Menu</div>
      <div className="nav">
        {NAV.map((item) => (
          <button key={item.key} className={tab === item.key ? 'active' : ''} onClick={() => setTab(item.key)}>
            <span className="lab">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="side-bottom">
        <button className="side-menu-btn" onClick={handleLogout}>
          <span className="lab">Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}
