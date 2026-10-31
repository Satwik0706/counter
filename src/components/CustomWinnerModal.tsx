import React, { useState } from 'react';
import { X, Crown, Trophy, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MatchConfig, WinReason } from '../types';

interface CustomWinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MatchConfig;
  team1Score: number;
  team2Score: number;
  onConfirmWinner: (team: 1 | 2, reason: WinReason, notes?: string) => void;
}

export const CustomWinnerModal: React.FC<CustomWinnerModalProps> = ({
  isOpen,
  onClose,
  config,
  team1Score,
  team2Score,
  onConfirmWinner,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<1 | 2>(1);
  const [reason, setReason] = useState<WinReason>('operator_override');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmWinner(selectedTeam, reason, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-cream-card rounded-3xl p-6 border border-cream-300 shadow-cream-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-cream-50 shadow-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-ink">
                Declare Custom Winner
              </h3>
              <p className="text-xs text-ink-muted">
                Referee / Operator decision to finalize match
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

        {/* Content */}
        <div className="py-5 space-y-4">
          {/* Step 1: Choose Winner Team */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Select Winning Team / Player
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTeam(1)}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedTeam === 1
                    ? 'bg-shuttle-emerald/10 border-shuttle-emerald ring-2 ring-shuttle-emerald/20'
                    : 'bg-cream-100 hover:bg-cream-200 border-cream-300'
                }`}
              >
                {selectedTeam === 1 && (
                  <CheckCircle2 className="w-5 h-5 text-shuttle-emerald absolute top-3 right-3" />
                )}
                <span className="text-[10px] uppercase font-bold text-ink-faint">Team 1</span>
                <p className="font-serif font-bold text-lg text-ink truncate mt-0.5">
                  {config.team1Name}
                </p>
                <p className="text-xs text-ink-muted font-mono mt-1">
                  Current Score: <strong>{team1Score}</strong>
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTeam(2)}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedTeam === 2
                    ? 'bg-shuttle-emerald/10 border-shuttle-emerald ring-2 ring-shuttle-emerald/20'
                    : 'bg-cream-100 hover:bg-cream-200 border-cream-300'
                }`}
              >
                {selectedTeam === 2 && (
                  <CheckCircle2 className="w-5 h-5 text-shuttle-emerald absolute top-3 right-3" />
                )}
                <span className="text-[10px] uppercase font-bold text-ink-faint">Team 2</span>
                <p className="font-serif font-bold text-lg text-ink truncate mt-0.5">
                  {config.team2Name}
                </p>
                <p className="text-xs text-ink-muted font-mono mt-1">
                  Current Score: <strong>{team2Score}</strong>
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Official Reason
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'operator_override', label: 'Operator Decision' },
                { id: 'deuce_won', label: 'Deuce Resolution' },
                { id: 'opponent_retired', label: 'Opponent Retired (Injury)' },
                { id: 'disqualification', label: 'Disqualification / Walkover' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setReason(item.id as WinReason)}
                  className={`p-2.5 rounded-xl text-left font-medium border transition-all ${
                    reason === item.id 
                      ? 'bg-cream-300 text-ink border-cream-400 font-bold' 
                      : 'bg-cream-100 hover:bg-cream-200 text-ink-soft border-cream-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Optional notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
              Umpire / Match Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Awarded match due to ankle injury at 18-19"
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-shuttle-emerald/40"
            />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              This will officially finish the match and save the final result to the database with this custom decision.
            </span>
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
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-shuttle-forest hover:bg-shuttle-emerald text-cream-50 transition-colors shadow-sm"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Confirm & Award Win</span>
          </button>
        </div>
      </div>
    </div>
  );
};
