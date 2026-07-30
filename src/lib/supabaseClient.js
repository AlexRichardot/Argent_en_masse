import { createClient } from '@supabase/supabase-js';

// Mêmes identifiants que la version précédente — la table household_state
// et les comptes existants (Alex/Léa) restent valables sans rien changer côté Supabase.
export const SUPABASE_URL = 'https://oqfygqzlkfdluybokyyo.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZnlncXpsa2ZkbHV5Ym9reXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzOTI1MTYsImV4cCI6MjEwMDk2ODUxNn0.K9W5Bw-E5vK001_H7MNpFHddzELkRGI5xHeRniDc3SQ';

// Le client supabase-js gère lui-même : persistance de session, refresh de token,
// et écoute des changements d'auth — tout ce qu'on avait codé à la main avant.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
