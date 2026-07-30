import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { blankState, normalizeState } from '../lib/metrics';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { session } = useAuth();
  const [state, setState] = useState(blankState());
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | pending | ok | error
  const saveTimer = useRef(null);
  const lastAppliedAt = useRef(0);

  const push = useCallback(async (nextState) => {
    if (!session) return;
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from('household_state')
      .upsert({ user_id: session.user.id, data: nextState, updated_at: nowIso });
    if (error) { setSyncStatus('error'); return; }
    lastAppliedAt.current = new Date(nowIso).getTime();
    setSyncStatus('ok');
  }, [session]);

  const pull = useCallback(async () => {
    if (!session) return;
    setSyncStatus((s) => (s === 'idle' ? 'pending' : s));
    const { data, error } = await supabase
      .from('household_state')
      .select('data, updated_at')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) { setSyncStatus('error'); return; }
    if (data) {
      const remoteTime = new Date(data.updated_at).getTime();
      if (remoteTime >= lastAppliedAt.current) {
        lastAppliedAt.current = remoteTime;
        setState(normalizeState(data.data));
      }
    } else {
      await push(blankState()); // nouveau compte : crée la ligne à zéro
      setState(blankState());
    }
    setSyncStatus('ok');
    setLoaded(true);
  }, [session, push]);

  // Au changement de compte (connexion/déconnexion) : repart de zéro puis tire les données réelles.
  useEffect(() => {
    if (session) {
      setLoaded(false);
      lastAppliedAt.current = 0;
      pull();
    } else {
      setState(blankState());
      setLoaded(false);
      lastAppliedAt.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Vérifie les mises à jour de l'autre appareil toutes les 20s.
  useEffect(() => {
    if (!session) return;
    const t = setInterval(pull, 20000);
    return () => clearInterval(t);
  }, [session, pull]);

  const updateState = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => push(next), 400);
      return next;
    });
  }, [push]);

  // Pousse immédiatement tout changement en attente (utilisé avant une déconnexion).
  const flush = useCallback(async () => {
    clearTimeout(saveTimer.current);
    await push(state);
  }, [push, state]);

  return (
    <DataContext.Provider value={{ state, updateState, loaded, syncStatus, pull, flush }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
