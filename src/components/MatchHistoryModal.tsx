import React, { useState, useEffect } from 'react';
import { 
  X, 
  History, 
  Search, 
  Trash2, 
  Trophy, 
  Database, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  UploadCloud,
  Check
} from 'lucide-react';
import { SavedMatch } from '../types';
import { getAllMatches, removeMatch, syncLocalMatchesToSupabase } from '../lib/storage';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupabaseConfig: () => void;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  onOpenSupabaseConfig,
}) => {
  const [matches, setMatches] = useState<SavedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local' | 'hybrid'>('local');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await getAllMatches();
      setMatches(res.matches || []);
      setSource(res.source);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMatches();
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this match record permanently?')) {
      await removeMatch(id);
      setMatches(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncLocalMatchesToSupabase();
      setSyncResult(`Successfully synced ${res.syncedCount} matches to Supabase!`);
      await loadMatches();
    } catch {
      setSyncResult('Sync encountered an issue. Check Supabase connection.');
    } finally {
      setSyncing(false);
    }
  };

  const filtered = matches.filter(m => 
    m.team1_name.toLowerCase().includes(search.toLowerCase()) ||
    m.team2_name.toLowerCase().includes(search.toLowerCase()) ||
    m.winner_name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-cream-card rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-cream-lg max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-cream-50 shadow-sm">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-xl text-ink">Match Records</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  source === 'supabase' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {source === 'supabase' ? 'Supabase Synced' : 'Local Storage'}
                </span>
              </div>
              <p className="text-xs text-ink-muted">Past badminton match scores and timeline logs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:bg-cream-200 hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Refresh */}
        <div className="py-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-faint" />
            <input
              type="text"
              placeholder="Search team or winner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-cream-50 border border-cream-200 text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-shuttle-emerald/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadMatches}
              disabled={loading}
              className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-muted hover:text-ink border border-cream-200 transition-colors"
              title="Refresh matches"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-shuttle-emerald' : ''}`} />
            </button>

            <button
              onClick={handleSyncToSupabase}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-cream-100 hover:bg-cream-200 text-ink-soft border border-cream-200 transition-colors"
              title="Sync local matches up to Supabase"
            >
              <UploadCloud className="w-3.5 h-3.5 text-shuttle-emerald" />
              <span className="hidden sm:inline">Sync to Supabase</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenSupabaseConfig();
              }}
              className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-muted hover:text-ink border border-cream-200 transition-colors"
              title="Supabase Config"
            >
              <Database className="w-4 h-4 text-shuttle-forest" />
            </button>
          </div>
        </div>

        {syncResult && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncResult}</span>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            <div className="text-center py-12 text-ink-muted text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-shuttle-emerald" />
              Loading match records...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-ink-muted text-xs">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-ink-faint" />
              <p className="font-semibold text-ink">No match records found.</p>
              <p className="mt-1">Completed matches will automatically be saved here and in Supabase!</p>
            </div>
          ) : (
            filtered.map((match) => {
              const isExpanded = expandedId === match.id;
              return (
                <div 
                  key={match.id}
                  onClick={() => setExpandedId(isExpanded ? null : match.id)}
                  className="rounded-2xl border border-cream-200 bg-cream-50/70 hover:bg-cream-100/60 transition-all p-3.5 sm:p-4 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-ink-muted mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(match.created_at)}</span>
                        <span>•</span>
                        <span className="capitalize">{match.match_format}</span>
                        <span>•</span>
                        <span>{match.target_points} pts</span>
                      </div>

                      <div className="flex items-center gap-2 font-serif font-bold text-base text-ink truncate">
                        <span>{match.team1_name}</span>
                        <span className="font-sans font-mono text-xs px-2 py-0.5 rounded-full bg-cream-200 font-extrabold text-ink">
                          {match.sets_won_team1} - {match.sets_won_team2}
                        </span>
                        <span>{match.team2_name}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs font-semibold text-shuttle-forest">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          Winner: {match.winner_name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cream-200 text-ink-muted">
                          {match.win_reason}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDelete(match.id, e)}
                        className="p-1.5 rounded-lg text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete match record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-ink-muted">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-cream-200 space-y-2 text-xs">
                      {/* Set breakdown */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                          Set Score Summary
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {match.scores && match.scores.length > 0 ? (
                            match.scores.map((s, idx) => (
                              <div key={idx} className="px-2.5 py-1 rounded-lg bg-cream-200 text-ink font-mono font-bold">
                                Set {idx + 1}: {s.team1Score} - {s.team2Score}
                              </div>
                            ))
                          ) : (
                            <div className="px-2.5 py-1 rounded-lg bg-cream-200 text-ink font-mono font-bold">
                              {match.sets_won_team1} - {match.sets_won_team2}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Point logs count */}
                      <div className="flex items-center justify-between text-ink-muted text-[11px] pt-1">
                        <span>Points Recorded: {match.score_logs?.length || 0}</span>
                        {match.notes && <span>Note: {match.notes}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-xs text-ink-muted">
          <span>{matches.length} matches recorded</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-cream-200 hover:bg-cream-300 text-ink transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
