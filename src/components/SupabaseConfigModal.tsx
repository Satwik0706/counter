import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Key, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Code
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    onConfigUpdated();
    onClose();
  };

  const handleTest = async () => {
    if (!url || !anonKey) {
      setTestResult({ success: false, message: 'Please enter both the Supabase URL and Anon Key.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(url, anonKey);
    setTestResult(result);
    setTesting(false);
  };

  const sqlSchema = `-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  team1_name TEXT NOT NULL,
  team2_name TEXT NOT NULL,
  team1_players TEXT[] DEFAULT '{}',
  team2_players TEXT[] DEFAULT '{}',
  match_format TEXT NOT NULL DEFAULT 'singles',
  target_points INT NOT NULL DEFAULT 21,
  total_sets INT NOT NULL DEFAULT 1,
  sets_won_team1 INT NOT NULL DEFAULT 0,
  sets_won_team2 INT NOT NULL DEFAULT 0,
  winner_team INT,
  winner_name TEXT,
  win_reason TEXT DEFAULT 'normal',
  scores JSONB NOT NULL DEFAULT '[]'::jsonb,
  score_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds INT DEFAULT 0,
  is_deuce_played BOOLEAN DEFAULT false,
  notes TEXT
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON matches FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(created_at DESC);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const copyEnv = () => {
    const envText = `VITE_SUPABASE_URL=${url || 'https://YOUR-PROJECT.supabase.co'}\nVITE_SUPABASE_ANON_KEY=${anonKey || 'YOUR-ANON-KEY'}`;
    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-cream-card rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-cream-lg max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-cream-50 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-ink">
                Supabase Database Setup
              </h3>
              <p className="text-xs text-ink-muted">
                Store previous badminton match results & score logs
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:bg-cream-200 hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Inputs */}
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Project URL</span>
            </label>
            <input
              type="text"
              placeholder="https://xyzabcdefg.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 font-mono text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-shuttle-emerald/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>Anon Public Key</span>
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 font-mono text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-shuttle-emerald/40"
            />
          </div>

          {/* Test Connection Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cream-200 hover:bg-cream-300 text-ink border border-cream-300 transition-colors disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <span className="text-[11px] text-ink-muted">
              Verify credentials with Supabase servers
            </span>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                : 'bg-amber-50 text-amber-950 border-amber-300'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* SQL Schema Copy Section */}
          <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-shuttle-forest" />
                <span>Supabase SQL Table Schema</span>
              </span>
              <button
                type="button"
                onClick={copySql}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cream-200 hover:bg-cream-300 text-[11px] font-semibold text-ink transition-colors"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <p className="text-[11px] text-ink-muted">
              Copy and execute this script once in your Supabase SQL editor to create the <code className="bg-cream-200 px-1 rounded font-mono">matches</code> table.
            </p>
          </div>

          {/* Vercel Environment Variables Section */}
          <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">
                ▲ Push to Vercel (.env format)
              </span>
              <button
                type="button"
                onClick={copyEnv}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cream-200 hover:bg-cream-300 text-[11px] font-semibold text-ink transition-colors"
              >
                {copiedEnv ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEnv ? 'Copied' : 'Copy Env'}</span>
              </button>
            </div>
            <p className="text-[11px] text-ink-muted">
              In Vercel Project Settings &gt; Environment Variables, add <code className="bg-cream-200 px-1 rounded font-mono">VITE_SUPABASE_URL</code> and <code className="bg-cream-200 px-1 rounded font-mono">VITE_SUPABASE_ANON_KEY</code>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-cream-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-ink-muted hover:bg-cream-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-shuttle-forest hover:bg-shuttle-emerald text-cream-50 transition-colors shadow-sm"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};
