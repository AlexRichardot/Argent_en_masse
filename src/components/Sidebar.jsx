import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Confirm from './Confirm';
import Icon from './Icon';
import ProfileEditor from './ProfileEditor';
import fyraIcon from '../assets/fyra-icon.png';

const MAIN_NAV = [
  { key: 'overview', label: "Vue d'ensemble", short: 'Aperçu', icon: 'grid' },
  { key: 'flow', label: 'Revenus & dépenses', short: 'Flux', icon: 'flow' },
  { key: 'wealth', label: 'Épargne & patrimoine', short: 'Épargne', icon: 'wallet' },
  { key: 'projects', label: 'Projets & échéances', short: 'Projets', icon: 'calendar' },
];
const RECO_ITEM = { key: 'reco', label: 'Recommandations', icon: 'bulb' };

export default function Sidebar({ tab, setTab }) {
  const { signOut } = useAuth();
  const { state, updateState, flush } = useData();
  const [confirming, setConfirming] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [managingProfiles, setManagingProfiles] = useState(false);

  async function handleLogout() {
    setConfirming(false);
    await flush();
    await signOut();
  }

  function saveProfiles(profiles) {
    updateState((prev) => ({ ...prev, profiles }));
    setManagingProfiles(false);
  }

  function selectTab(key) {
    setTab(key);
    setMoreOpen(false);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo">
          <img className="mk" src={fyraIcon} alt="" />
          <b>Fyra</b>
        </div>
        <button className="burger-btn" onClick={() => setMoreOpen((o) => !o)} aria-label="Plus d'options">
          <Icon name="more" size={20} />
        </button>
      </div>

      <div className="nav">
        {MAIN_NAV.map((item) => (
          <button key={item.key} className={tab === item.key ? 'active' : ''} onClick={() => selectTab(item.key)}>
            <Icon name={item.icon} size={17} />
            <span className="lab">{item.label}</span>
          </button>
        ))}
        <button className={tab === RECO_ITEM.key ? 'active' : ''} onClick={() => selectTab(RECO_ITEM.key)}>
          <Icon name={RECO_ITEM.icon} size={17} />
          <span className="lab">{RECO_ITEM.label}</span>
        </button>
      </div>

      <nav className="mobile-tabbar">
        {MAIN_NAV.map((item) => (
          <button key={item.key} className={tab === item.key ? 'active' : ''} onClick={() => selectTab(item.key)}>
            <Icon name={item.icon} size={18} />
            <span>{item.short}</span>
          </button>
        ))}
      </nav>

      <div className="side-bottom">
        <button className="side-menu-btn" onClick={() => setManagingProfiles(true)} style={{ marginBottom: 8 }}>
          <Icon name="edit" size={16} />
          <span className="lab">Gérer les profils</span>
        </button>
        <button className="side-menu-btn" onClick={() => setConfirming(true)}>
          <Icon name="logout" size={16} />
          <span className="lab">Se déconnecter</span>
        </button>
      </div>

      <div className={`more-panel ${moreOpen ? 'open' : ''}`}>
        <button className={tab === RECO_ITEM.key ? 'active' : ''} onClick={() => selectTab(RECO_ITEM.key)}>
          <Icon name={RECO_ITEM.icon} size={17} />
          <span className="lab">{RECO_ITEM.label}</span>
        </button>
        <button onClick={() => { setMoreOpen(false); setManagingProfiles(true); }}>
          <Icon name="edit" size={16} />
          <span className="lab">Gérer les profils</span>
        </button>
        <button onClick={() => { setMoreOpen(false); setConfirming(true); }}>
          <Icon name="logout" size={16} />
          <span className="lab">Se déconnecter</span>
        </button>
      </div>

      {managingProfiles && (
        <div className="overlay on" style={{ position: 'fixed' }} onClick={(e) => { if (e.target === e.currentTarget) setManagingProfiles(false); }}>
          <div className="modal" style={{ color: 'var(--ink)' }}>
            <h2>Gérer les profils</h2>
            <p className="lead">Renommez, ajoutez ou retirez des profils (6 maximum).</p>
            <ProfileEditor initialProfiles={state.profiles} onSave={saveProfiles}
              onCancel={() => setManagingProfiles(false)} cancelLabel="Fermer" saveLabel="Enregistrer" />
          </div>
        </div>
      )}

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
