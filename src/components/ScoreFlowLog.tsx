import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Copy, 
  Check, 
  ListOrdered, 
  Filter
} from 'lucide-react';
import { MatchConfig, PointLog } from '../types';

interface ScoreFlowLogProps {
  logs: PointLog[];
  config: MatchConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreFlowLog: React.FC<ScoreFlowLogProps> = ({
  logs,
  config,
  isOpen,
  onClose,
}) => {
  const [filterTeam, setFilterTeam] = useState<'all' | 1 | 2>('all');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (filterTeam === 'all') return true;
    return log.scoringTeam === filterTeam;
  });

  const copyLogText = () => {
    const lines = [
      `=== BADMINTON MATCH SCORE FLOW ===`,
      `${config.team1Name} vs ${config.team2Name}`,
      `Format: ${config.matchFormat.toUpperCase()} | Target: ${config.targetPoints} pts`,
      `----------------------------------------`,
      ...logs.map((l, i) => {
        const teamName = l.scoringTeam === 1 ? config.team1Name : config.team2Name;
        return `[#${i + 1}] (${l.timestamp}) Set ${l.setNumber}: ${teamName} scored -> ${l.score1} - ${l.score2} (${l.note || 'Point'})`;
      }),
      `----------------------------------------`,
      `Total Points Played: ${logs.length}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate streak/momentum stats
  const team1PointsCount = logs.filter(l => l.scoringTeam === 1).length;
  const team2PointsCount = logs.filter(l => l.scoringTeam === 2).length;

  return (
    <div className="w-full bg-cream-card rounded-2xl border border-cream-200/90 shadow-cream-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-cream-100/70 border-b border-cream-200">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-shuttle-forest" />
          <h3 className="font-serif font-bold text-base text-ink">
            Match Score Flow
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-ink font-mono font-semibold">
            {logs.length} pts
          </span>
        </div>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              onClick={copyLogText}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-cream-200 hover:bg-cream-300 text-ink transition-colors"
              title="Copy text log"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:bg-cream-200 hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 py-2.5 bg-cream-50/60 border-b border-cream-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-shuttle-emerald"></span>
          <span className="text-ink-muted truncate">{config.team1Name}:</span>
          <strong className="font-mono text-ink">{team1PointsCount} pts</strong>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-shuttle-clay"></span>
          <span className="text-ink-muted truncate">{config.team2Name}:</span>
          <strong className="font-mono text-ink">{team2PointsCount} pts</strong>
        </div>
        <div className="hidden sm:flex items-center justify-end gap-1 text-ink-muted">
          <Filter className="w-3 h-3" />
          <button
            onClick={() => setFilterTeam('all')}
            className={`px-1.5 py-0.5 rounded ${filterTeam === 'all' ? 'bg-cream-300 font-bold text-ink' : 'hover:bg-cream-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterTeam(1)}
            className={`px-1.5 py-0.5 rounded ${filterTeam === 1 ? 'bg-cream-300 font-bold text-ink' : 'hover:bg-cream-200'}`}
          >
            T1
          </button>
          <button
            onClick={() => setFilterTeam(2)}
            className={`px-1.5 py-0.5 rounded ${filterTeam === 2 ? 'bg-cream-300 font-bold text-ink' : 'hover:bg-cream-200'}`}
          >
            T2
          </button>
        </div>
      </div>

      {/* Points Scrollable List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-cream-100 p-2 sm:p-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-ink-muted text-xs">
            <Clock className="w-6 h-6 mx-auto mb-2 text-ink-faint opacity-60" />
            No points recorded yet in this match. Tap on a team card to start scoring!
          </div>
        ) : (
          [...filteredLogs].reverse().map((log, index) => {
            const actualPointNumber = filteredLogs.length - index;
            const isTeam1 = log.scoringTeam === 1;
            const scorerName = isTeam1 ? config.team1Name : config.team2Name;

            return (
              <div
                key={log.id}
                className="flex items-center justify-between py-2.5 px-2 hover:bg-cream-100/50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 text-center font-mono text-[11px] font-bold text-ink-faint">
                    #{actualPointNumber}
                  </span>

                  <div className={`w-2 h-2 rounded-full ${isTeam1 ? 'bg-shuttle-emerald' : 'bg-shuttle-clay'}`} />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-ink">
                        {scorerName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cream-200 text-ink-muted font-medium">
                        Set {log.setNumber}
                      </span>
                      {log.isDeucePoint && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-bold uppercase">
                          Deuce
                        </span>
                      )}
                    </div>
                    {log.note && (
                      <p className="text-[11px] text-ink-muted mt-0.5 italic">
                        {log.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Score Pill */}
                  <div className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-cream-200 text-ink shadow-sm">
                    <span className={isTeam1 ? 'text-shuttle-forest font-extrabold' : ''}>{log.score1}</span>
                    <span className="mx-1 text-ink-faint">-</span>
                    <span className={!isTeam1 ? 'text-shuttle-clay font-extrabold' : ''}>{log.score2}</span>
                  </div>

                  {/* Timestamp */}
                  <span className="font-mono text-[11px] text-ink-faint hidden sm:inline">
                    {log.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
