import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SavedMatch, SupabaseConfig } from '../types';

const STORAGE_KEY_SUPABASE = 'shuttlescore_supabase_config';

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localSaved = localStorage.getItem(STORAGE_KEY_SUPABASE);
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
          isConfigured: true,
        };
      }
    } catch {
      // Fallback
    }
  }

  const isConfigured = Boolean(envUrl && envKey);
  return {
    url: envUrl,
    anonKey: envKey,
    isConfigured,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(
    STORAGE_KEY_SUPABASE,
    JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
  );
  currentClient = null; // force re-create client
}

let currentClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured || !config.url || !config.anonKey) {
    return null;
  }

  if (!currentClient) {
    try {
      currentClient = createClient(config.url, config.anonKey);
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  }

  return currentClient;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url.trim(), anonKey.trim());
    const { error } = await testClient.from('matches').select('id').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        return { 
          success: false, 
          message: 'Connected to Supabase, but the "matches" table does not exist yet! Please run the SQL schema in your Supabase SQL editor.' 
        };
      }
      return { success: false, message: `Supabase error: ${error.message}` };
    }
    return { success: true, message: 'Connection successful! Table "matches" is ready.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Connection failed: ${message}` };
  }
}

export async function saveMatchToSupabase(match: SavedMatch): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const { error } = await client.from('matches').insert([
      {
        id: match.id,
        created_at: match.created_at,
        team1_name: match.team1_name,
        team2_name: match.team2_name,
        team1_players: match.team1_players || [],
        team2_players: match.team2_players || [],
        match_format: match.match_format,
        target_points: match.target_points,
        total_sets: match.total_sets,
        sets_won_team1: match.sets_won_team1,
        sets_won_team2: match.sets_won_team2,
        winner_team: match.winner_team,
        winner_name: match.winner_name,
        win_reason: match.win_reason,
        scores: match.scores,
        score_logs: match.score_logs,
        duration_seconds: match.duration_seconds,
        is_deuce_played: match.is_deuce_played,
        notes: match.notes || '',
      },
    ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

export async function fetchMatchesFromSupabase(): Promise<{ data: SavedMatch[] | null; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await client
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: (data as SavedMatch[]) || [] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { data: null, error: message };
  }
}

export async function deleteMatchFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await client.from('matches').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
