import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Confirm from './Confirm';
import Icon from './Icon';
import fyraIcon from '../assets/fyra-icon.png';

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
  const [confirming, setConfirming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setConfirming(false);
    await flush();
    await signOut();
  }

  function selectTab(key) {
    setTab(key);
    setMenuOpen(false);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo">
          <img className="mk" src={fyraIcon} alt="" />
          <b>Fyra</b>
        </div>
        <button className="burger-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
          <Icon name={menuOpen ? 'close' : 'burger'} size={20} />
        </button>
      </div>
      <div className={`nav-panel ${menuOpen ? 'open' : ''}`}>
        <div className="menu-lbl">Menu</div>
        <div className="nav">
          {NAV.map((item) => (
            <button key={item.key} className={tab === item.key ? 'active' : ''} onClick={() => selectTab(item.key)}>
              <span className="lab">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="side-bottom">
          <button className="side-menu-btn" onClick={() => setConfirming(true)}>
            <span className="lab">Se déconnecter</span>
          </button>
        </div>
      </div>
      {confirming && (
        <Confirm
          title="Se déconnecter ?"
          message="Vos données restent en ligne sur votre compte."
          confirmLabel="Se déconnecter"
          onConfirm={handleLogout}
          onCancel={() => setConfirming(false)}
        />
      )}
    </aside>
  );
}
