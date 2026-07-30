import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Confirm from './Confirm';

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
  const [justSaved, setJustSaved] = useState(false);

  async function handleLogout() {
    setConfirming(false);
    await flush();
    await signOut();
  }

  async function handleSaveClick() {
    await flush();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
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
      <button className="side-save" onClick={handleSaveClick}>
        <span>{justSaved ? 'Enregistré ✓' : 'Sauvegarder'}</span>
      </button>
      <div className="side-bottom">
        <button className="side-menu-btn" onClick={() => setConfirming(true)}>
          <span className="lab">Se déconnecter</span>
        </button>
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
