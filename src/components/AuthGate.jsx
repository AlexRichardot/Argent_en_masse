import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthGate() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function handle(action) {
    if (!email || !password) { setMsg('Merci de remplir email et mot de passe.'); return; }
    if (action === 'signup' && password.length < 6) { setMsg('Mot de passe : 6 caractères minimum.'); return; }
    setBusy(true);
    setMsg(action === 'signup' ? 'Création du compte…' : 'Connexion…');
    try {
      if (action === 'signup') await signUp(email, password);
      else await signIn(email, password);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overlay on forced" style={{ position: 'fixed' }}>
      <div className="modal">
        <h2>Mon compte</h2>
        <p className="lead">
          Connectez-vous pour retrouver vos données sur n'importe quel appareil. Utilisez le même
          email et mot de passe sur l'ordinateur de Léa.
        </p>
        <div className="field">
          <label>Email</label>
          <input className="inp" type="email" autoComplete="username" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="foyer@exemple.fr" />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input className="inp" type="password" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères minimum" />
        </div>
        <div className="foot">
          <button className="btn primary" disabled={busy} onClick={() => handle('signin')}>Se connecter</button>
          <button className="btn soft" disabled={busy} onClick={() => handle('signup')}>Créer un compte</button>
        </div>
        <div style={{ fontSize: '12.5px', color: 'var(--muted)', textAlign: 'center', minHeight: 16, marginTop: 10 }}>
          {msg}
        </div>
      </div>
    </div>
  );
}
