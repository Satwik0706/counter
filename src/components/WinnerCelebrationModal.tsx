import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Database, 
  Clock, 
  ListOrdered,
  X
} from 'lucide-react';
import { MatchConfig, SetScore, WinReason } from '../types';

interface WinnerCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerTeam: 1 | 2;
  winnerName: string;
  winReason: WinReason;
  config: MatchConfig;
  setScores: SetScore[];
  team1SetsWon: number;
  team2SetsWon: number;
  elapsedSeconds: number;
  savedToSupabase: boolean;
  onNewMatch: () => void;
  onRematch: () => void;
  onViewScoreFlow: () => void;
}

export const WinnerCelebrationModal: React.FC<WinnerCelebrationModalProps> = ({
  isOpen,
  onClose,
  winnerTeam,
  winnerName,
  winReason,
  config,
  setScores,
  team1SetsWon,
  team2SetsWon,
  elapsedSeconds,
  savedToSupabase,
  onNewMatch,
  onRematch,
  onViewScoreFlow,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fire confetti bursts in cream, gold, and tournament green
      const end = Date.now() + 1500;
      const colors = ['#2D6A4F', '#D97706', '#C2593F', '#F5EFE6'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  const getReasonLabel = (reason: WinReason) => {
    switch (reason) {
      case 'points_reached': return 'Target Points Achieved';
      case 'deuce_won': return 'Won by 2 in Deuce';
      case 'operator_override': return 'Awarded by Referee Decision';
      case 'opponent_retired': return 'Opponent Retired';
      case 'disqualification': return 'Walkover / Disqualification';
      default: return 'Match Concluded';
    }
  };

  const copyMatchSummary = () => {
    const setsText = setScores.map((s, idx) => `Set ${idx + 1}: ${s.team1Score}-${s.team2Score}`).join(' | ');
    const text = [
      `🏸 BADMINTON MATCH RESULT 🏸`,
      `🏆 WINNER: ${winnerName}`,
      `Match: ${config.team1Name} vs ${config.team2Name}`,
      `Sets: ${team1SetsWon} - ${team2SetsWon} (${setsText})`,
      `Duration: ${formatTime(elapsedSeconds)}`,
      `Decision: ${getReasonLabel(winReason)}`,
      `Scored via ShuttleScore`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-cream-card rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-cream-lg text-center relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-ink-muted hover:bg-cream-200 transition-colors"
          title="Review score board"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy & Badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 flex items-center justify-center text-ink shadow-lg shadow-amber-500/20 mb-4 animate-bounce">
          <Trophy className="w-10 h-10 text-cream-card stroke-[2.2]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          MATCH WINNER
        </span>

        {/* Winner Name */}
        <h2 className="font-serif font-black text-3xl sm:text-4xl text-ink tracking-tight mt-3 mb-1 truncate">
          {winnerName}
        </h2>
        <p className="text-xs font-semibold text-shuttle-emerald">
          {getReasonLabel(winReason)}
        </p>

        {/* Score Card Summary */}
        <div className="my-5 p-4 rounded-2xl bg-cream-100/80 border border-cream-200 text-left space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-cream-200">
            <span className="text-xs font-bold text-ink-muted uppercase">Set Scores</span>
            <span className="font-mono text-xs text-ink-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={`font-semibold ${winnerTeam === 1 ? 'text-ink font-bold' : 'text-ink-muted'}`}>
                {config.team1Name} {winnerTeam === 1 && '🏆'}
              </span>
              <span className="font-mono font-bold text-ink text-base">
                {team1SetsWon} sets
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className={`font-semibold ${winnerTeam === 2 ? 'text-ink font-bold' : 'text-ink-muted'}`}>
                {config.team2Name} {winnerTeam === 2 && '🏆'}
              </span>
              <span className="font-mono font-bold text-ink text-base">
                {team2SetsWon} sets
              </span>
            </div>
          </div>

          {/* Individual Sets Breakdown */}
          {setScores.length > 0 && (
            <div className="pt-2 border-t border-cream-200 flex items-center justify-around gap-2 text-xs">
              {setScores.map((set, i) => (
                <div key={i} className="text-center font-mono">
                  <span className="text-[10px] text-ink-muted block uppercase">Set {i + 1}</span>
                  <span className="font-bold text-ink px-2 py-0.5 rounded bg-cream-200 inline-block mt-0.5">
                    {set.team1Score} - {set.team2Score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Supabase Status Pill */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-ink-muted mb-5">
          <Database className="w-3.5 h-3.5" />
          <span>
            {savedToSupabase 
              ? '✅ Result permanently stored in Supabase' 
              : '💾 Result saved locally (Supabase ready to connect)'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copyMatchSummary}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cream-200 hover:bg-cream-300 text-ink font-semibold text-xs border border-cream-300 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Report' : 'Copy Result'}</span>
            </button>

            <button
              onClick={onViewScoreFlow}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cream-200 hover:bg-cream-300 text-ink font-semibold text-xs border border-cream-300 transition-colors"
            >
              <ListOrdered className="w-4 h-4 text-shuttle-forest" />
              <span>Score Flow</span>
            </button>
          </div>

          <button
            onClick={onRematch}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-shuttle-forest to-shuttle-emerald hover:brightness-105 active:scale-[0.99] text-cream-50 font-bold text-sm shadow-cream-md transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rematch (Same Teams)</span>
          </button>

          <button
            onClick={onNewMatch}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-ink-muted hover:text-ink hover:bg-cream-100 transition-colors"
          >
            Configure New Teams & Rules
          </button>
        </div>
      </div>
    </div>
  );
};
