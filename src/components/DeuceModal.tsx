import React, { useState } from 'react';
import { X, Split, Crown } from 'lucide-react';
import { MatchConfig } from '../types';

interface DeuceModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MatchConfig;
  isDeuce: boolean;
  onToggleDeuce: (enabled: boolean) => void;
  onSetGoldenCap: (cap: number) => void;
  onOpenCustomWinner: () => void;
}

export const DeuceModal: React.FC<DeuceModalProps> = ({
  isOpen,
  onClose,
  config,
  isDeuce,
  onToggleDeuce,
  onSetGoldenCap,
  onOpenCustomWinner,
}) => {
  const [goldenCap, setCap] = useState(config.goldenPointCap || 30);

  if (!isOpen) return null;

  const handleSaveCap = () => {
    onSetGoldenCap(goldenCap);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-cream-card rounded-3xl p-6 border border-cream-300 shadow-cream-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink">Deuce & Tiebreak Controls</h3>
              <p className="text-xs text-ink-muted">Official Badminton BWF & Custom Rules</p>
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
        <div className="py-4 space-y-4">
          {/* Deuce Status Card */}
          <div className={`p-4 rounded-2xl border transition-all ${isDeuce ? 'bg-amber-50/70 border-amber-300 text-amber-950' : 'bg-cream-100/60 border-cream-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-ink-muted">
                  Current Status
                </span>
                <p className="text-sm font-bold mt-0.5 text-ink">
                  {isDeuce ? '⚡ Deuce is ACTIVE (Win by 2 required)' : 'Regular Play (No Deuce Lock)'}
                </p>
              </div>
              <button
                onClick={() => onToggleDeuce(!isDeuce)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isDeuce 
                    ? 'bg-amber-500 hover:bg-amber-600 text-cream-50' 
                    : 'bg-cream-200 hover:bg-cream-300 text-ink border border-cream-300'
                }`}
              >
                {isDeuce ? 'Deactivate' : 'Force Deuce'}
              </button>
            </div>
            <p className="text-xs text-ink-muted mt-2">
              BWF Rules: When score reaches {config.targetPoints - 1}-{config.targetPoints - 1}, play continues until a player has a 2-point lead, or reaches {config.goldenPointCap} points.
            </p>
          </div>

          {/* Golden Cap Setting */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Golden Point Cap (Sudden Death ceiling)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[config.targetPoints + 2, 29, 30].map(cap => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setCap(cap)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    goldenCap === cap 
                      ? 'bg-shuttle-emerald text-cream-50 border-shuttle-forest shadow-sm' 
                      : 'bg-cream-100 hover:bg-cream-200 text-ink border-cream-300'
                  }`}
                >
                  Max {cap} pts
                </button>
              ))}
            </div>
          </div>

          {/* Custom Winner Action Bridge */}
          <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-ink">Direct Referee Decision</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCustomWinner();
                }}
                className="text-xs font-bold text-shuttle-forest hover:text-shuttle-emerald underline underline-offset-2"
              >
                Choose Winner →
              </button>
            </div>
            <p className="text-[11px] text-ink-muted mt-1">
              End the match or deuce immediately by choosing an operator-decided winner.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-cream-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-muted hover:bg-cream-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveCap}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-shuttle-forest hover:bg-shuttle-emerald text-cream-50 transition-colors shadow-sm"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
