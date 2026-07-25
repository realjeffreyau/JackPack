import { supabase } from './supabase';

/** Returns the current auth user id, signing in anonymously first if there is no session. */
export async function ensureAnonSession(): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user?.id) {
    return sessionData.session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    throw error ?? new Error('Anonymous sign-in failed.');
  }
  return data.user.id;
}
