import { useData } from '../context/DataContext';
import ProfileEditor from './ProfileEditor';

export default function ProfileGate() {
  const { updateState } = useData();

  function handleSave(profiles) {
    updateState((prev) => ({ ...prev, profiles }));
  }

  return (
    <div className="overlay on forced" style={{ position: 'fixed' }}>
      <div className="modal">
        <h2>Bienvenue 👋</h2>
        <p className="lead">
          Créez un profil par personne du foyer, et éventuellement un profil commun pour ce que vous
          partagez. Vous pourrez en ajouter ou en modifier plus tard (6 maximum).
        </p>
        <ProfileEditor initialProfiles={[]} onSave={handleSave} onCancel={null} saveLabel="Commencer" />
      </div>
    </div>
  );
}
