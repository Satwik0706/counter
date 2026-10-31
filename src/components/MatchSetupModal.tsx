import React, { useState } from 'react';
import { X, Play, Settings2 } from 'lucide-react';
import { MatchConfig, MatchFormat } from '../types';

interface MatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: MatchConfig;
  onStartMatch: (config: MatchConfig) => void;
}

export const MatchSetupModal: React.FC<MatchSetupModalProps> = ({
  isOpen,
  onClose,
  initialConfig,
  onStartMatch,
}) => {
  const [team1Name, setTeam1Name] = useState(initialConfig.team1Name);
  const [team2Name, setTeam2Name] = useState(initialConfig.team2Name);
  const [targetPoints, setTargetPoints] = useState(initialConfig.targetPoints);
  const [customPoints, setCustomPoints] = useState('');
  const [maxSets, setMaxSets] = useState(initialConfig.maxSets);
  const [matchFormat, setMatchFormat] = useState<MatchFormat>(initialConfig.matchFormat);
  const [initialServer, setInitialServer] = useState<1 | 2>(initialConfig.initialServer);
  const [deuceEnabled, setDeuceEnabled] = useState(initialConfig.deuceEnabled);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTarget = customPoints ? Math.max(1, parseInt(customPoints, 10) || 21) : targetPoints;

    onStartMatch({
      team1Name: team1Name.trim() || 'Team 1',
      team2Name: team2Name.trim() || 'Team 2',
      team1Players: [team1Name.trim() || 'Team 1'],
      team2Players: [team2Name.trim() || 'Team 2'],
      targetPoints: finalTarget,
      maxSets,
      matchFormat,
      deuceEnabled,
      goldenPointCap: finalTarget + 9, // e.g. 30 in 21-point match
      initialServer,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-cream-card rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-cream-lg max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-shuttle-emerald to-shuttle-forest flex items-center justify-center text-cream-50 shadow-sm">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-ink">
                New Badminton Match
              </h3>
              <p className="text-xs text-ink-muted">Configure teams, target points & rules</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:bg-cream-200 hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {/* Team Names */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Team 1 / Player 1 Name
              </label>
              <input
                type="text"
                required
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                placeholder="e.g. Viktor Axelsen / Team Alpha"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-sm font-semibold text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-shuttle-emerald/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Opponent Team 2 / Player 2 Name
              </label>
              <input
                type="text"
                required
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                placeholder="e.g. Lee Zii Jia / Team Beta"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-cream-300 text-sm font-semibold text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-shuttle-emerald/40"
              />
            </div>
          </div>

          {/* Match Target Points */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Match Points per Set
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[21, 15, 11].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => {
                    setTargetPoints(pts);
                    setCustomPoints('');
                  }}
                  className={`py-2 px-2 rounded-xl text-center border font-bold text-xs transition-all ${
                    targetPoints === pts && !customPoints
                      ? 'bg-shuttle-emerald text-cream-50 border-shuttle-forest shadow-sm'
                      : 'bg-cream-100 hover:bg-cream-200 text-ink border-cream-300'
                  }`}
                >
                  {pts} pts {pts === 21 && '★'}
                </button>
              ))}

              <input
                type="number"
                min="1"
                max="99"
                value={customPoints}
                onChange={(e) => {
                  setCustomPoints(e.target.value);
                }}
                placeholder="Custom"
                className={`w-full px-2 py-2 text-center rounded-xl text-xs font-bold border transition-all ${
                  customPoints 
                    ? 'bg-shuttle-emerald text-cream-50 border-shuttle-forest placeholder:text-cream-200' 
                    : 'bg-cream-100 border-cream-300 text-ink placeholder:text-ink-faint'
                }`}
              />
            </div>
            <p className="text-[11px] text-ink-muted mt-1">
              BWF Standard is 21 points. Quick matches commonly use 15 or 11 points.
            </p>
          </div>

          {/* Format & Max Sets */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Match Format
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['singles', 'doubles'] as MatchFormat[]).map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setMatchFormat(fmt)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                      matchFormat === fmt
                        ? 'bg-shuttle-forest text-cream-50 border-shuttle-forest'
                        : 'bg-cream-100 hover:bg-cream-200 text-ink border-cream-300'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Game Sets
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[1, 3, 5].map(sets => (
                  <button
                    key={sets}
                    type="button"
                    onClick={() => setMaxSets(sets)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      maxSets === sets
                        ? 'bg-shuttle-forest text-cream-50 border-shuttle-forest'
                        : 'bg-cream-100 hover:bg-cream-200 text-ink border-cream-300'
                    }`}
                  >
                    Best {sets}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Starting Server */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
              First Server (Toss Winner)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setInitialServer(1)}
                className={`p-2.5 rounded-xl border text-left font-semibold truncate transition-all ${
                  initialServer === 1
                    ? 'bg-shuttle-emerald/15 border-shuttle-emerald text-shuttle-forest ring-1 ring-shuttle-emerald'
                    : 'bg-cream-100 hover:bg-cream-200 text-ink border-cream-300'
                }`}
              >
                🏸 {team1Name || 'Team 1'} serves
              </button>

              <button
                type="button"
                onClick={() => setInitialServer(2)}
                className={`p-2.5 rounded-xl border text-left font-semibold truncate transition-all ${
                  initialServer === 2
                    ? 'bg-shuttle-emerald/15 border-shuttle-emerald text-shuttle-forest ring-1 ring-shuttle-emerald'
                    : 'bg-cream-100 hover:bg-cream-200 text-ink border-cream-300'
                }`}
              >
                🏸 {team2Name || 'Team 2'} serves
              </button>
            </div>
          </div>

          {/* Deuce rule toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-cream-100 border border-cream-300">
            <div>
              <span className="text-xs font-bold text-ink">BWF Deuce Rule</span>
              <p className="text-[11px] text-ink-muted">Win by 2 points if tied at target - 1</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={deuceEnabled} 
                onChange={(e) => setDeuceEnabled(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-shuttle-emerald"></div>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-shuttle-forest to-shuttle-emerald hover:brightness-105 active:scale-[0.99] text-cream-50 font-bold text-sm shadow-cream-md transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Match Counter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
