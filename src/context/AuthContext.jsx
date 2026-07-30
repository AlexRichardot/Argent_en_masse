import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = pas encore vérifié, null = déconnecté
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    // supabase-js écoute et persiste les changements de session (login, logout, refresh token)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setAuthError(error.message); throw error; }
  }

  async function signUp(email, password) {
    setAuthError('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setAuthError(error.message); throw error; }
    if (!data.session) {
      const msg = "Compte créé, mais confirmation d'email requise côté Supabase (désactivez « Confirm email » dans Authentication → Providers → Email).";
      setAuthError(msg);
      throw new Error(msg);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, authError, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
