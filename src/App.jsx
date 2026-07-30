import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import AuthGate from './components/AuthGate';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Overview from './components/tabs/Overview';
import Flow from './components/tabs/Flow';
import Wealth from './components/tabs/Wealth';
import Projects from './components/tabs/Projects';
import Reco from './components/tabs/Reco';

const TABS = { overview: Overview, flow: Flow, wealth: Wealth, projects: Projects, reco: Reco };

export default function App() {
  const { session } = useAuth();
  const { loaded } = useData();
  const [tab, setTab] = useState('overview');
  const [ownerFilter, setOwnerFilter] = useState('all');

  if (session === undefined) {
    return <div className="empty-note" style={{ padding: 60 }}>Chargement…</div>;
  }
  if (!session) {
    return <AuthGate />;
  }
  if (!loaded) {
    return <div className="empty-note" style={{ padding: 60 }}>Récupération de vos données…</div>;
  }

  const TabComponent = TABS[tab];

  return (
    <div className="app" id="app-root">
      <Sidebar tab={tab} setTab={setTab} />
      <div className="main">
        <Topbar ownerFilter={ownerFilter} setOwnerFilter={setOwnerFilter} />
        <div className="content">
          <main id="view">
            <TabComponent ownerFilter={ownerFilter} />
          </main>
        </div>
      </div>
    </div>
  );
}
