import { SavedMatch } from '../types';
import { getSupabaseConfig, saveMatchToSupabase, fetchMatchesFromSupabase, deleteMatchFromSupabase } from './supabase';

const LOCAL_STORAGE_KEY = 'shuttlescore_local_matches_v1';

export function getLocalMatches(): SavedMatch[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local matches:', err);
    return [];
  }
}

export function saveLocalMatch(match: SavedMatch): void {
  try {
    const current = getLocalMatches();
    const updated = [match, ...current.filter(m => m.id !== match.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving local match:', err);
  }
}

export function deleteLocalMatch(id: string): void {
  try {
    const current = getLocalMatches();
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error deleting local match:', err);
  }
}

export async function persistMatch(match: SavedMatch): Promise<{ savedToSupabase: boolean; error?: string }> {
  // 1. Always save locally first for maximum safety
  saveLocalMatch(match);

  // 2. Check if Supabase is active
  const config = getSupabaseConfig();
  if (config.isConfigured) {
    const supaResult = await saveMatchToSupabase(match);
    if (supaResult.success) {
      return { savedToSupabase: true };
    } else {
      return { savedToSupabase: false, error: supaResult.error };
    }
  }

  return { savedToSupabase: false, error: 'Supabase not configured' };
}

export async function getAllMatches(): Promise<{ matches: SavedMatch[]; source: 'supabase' | 'local' | 'hybrid'; error?: string }> {
  const config = getSupabaseConfig();
  if (config.isConfigured) {
    const supaRes = await fetchMatchesFromSupabase();
    if (supaRes.data) {
      return { matches: supaRes.data, source: 'supabase' };
    }
    // If Supabase failed, fallback to local with warning
    const local = getLocalMatches();
    return { matches: local, source: 'local', error: supaRes.error };
  }

  return { matches: getLocalMatches(), source: 'local' };
}

export async function removeMatch(id: string): Promise<void> {
  deleteLocalMatch(id);
  const config = getSupabaseConfig();
  if (config.isConfigured) {
    await deleteMatchFromSupabase(id);
  }
}

export async function syncLocalMatchesToSupabase(): Promise<{ syncedCount: number; errors: string[] }> {
  const local = getLocalMatches();
  let count = 0;
  const errors: string[] = [];

  for (const match of local) {
    const res = await saveMatchToSupabase(match);
    if (res.success) {
      count++;
    } else if (res.error) {
      errors.push(`${match.team1_name} vs ${match.team2_name}: ${res.error}`);
    }
  }

  return { syncedCount: count, errors };
}
