import React from 'react';
import { 
  Undo2, 
  Redo2, 
  Crown, 
  Split, 
  ListOrdered, 
  Play, 
  Pause, 
  Timer
} from 'lucide-react';

interface RefereeControlBarProps {
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  onUndo: () => void;
  onRedo: () => void;
  onOpenDeuceModal: () => void;
  onOpenCustomWinnerModal: () => void;
  onToggleScoreLog: () => void;
  isLogOpen: boolean;
  logCount: number;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  isDeuce: boolean;
}

export const RefereeControlBar: React.FC<RefereeControlBarProps> = ({
  canUndo,
  canRedo,
  undoCount,
  onUndo,
  onRedo,
  onOpenDeuceModal,
  onOpenCustomWinnerModal,
  onToggleScoreLog,
  isLogOpen,
  logCount,
  elapsedSeconds,
  isTimerRunning,
  onToggleTimer,
  isDeuce,
}) => {
  // Format elapsed seconds as MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-cream-card rounded-2xl p-3 sm:p-4 border border-cream-200/90 shadow-cream-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Undo & Redo Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-cream-100 hover:bg-cream-200 active:bg-cream-300 text-ink border border-cream-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            title="Undo last point (Z)"
          >
            <Undo2 className="w-4 h-4 text-shuttle-clay" />
            <span>Undo</span>
            {undoCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-cream-200 text-ink-muted">
                {undoCount}
              </span>
            )}
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl font-semibold text-xs bg-cream-100 hover:bg-cream-200 active:bg-cream-300 text-ink border border-cream-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            title="Redo (Y)"
          >
            <Redo2 className="w-4 h-4 text-ink-muted" />
            <span className="hidden sm:inline">Redo</span>
          </button>

          {/* Match Duration Timer */}
          <div className="flex items-center gap-1.5 bg-cream-100 px-3 py-2 rounded-xl border border-cream-300">
            <Timer className="w-3.5 h-3.5 text-ink-muted" />
            <span className="font-mono font-bold text-xs sm:text-sm text-ink tracking-wide">
              {formatTime(elapsedSeconds)}
            </span>
            <button
              onClick={onToggleTimer}
              className="p-1 rounded-md hover:bg-cream-200 text-ink-muted transition-colors ml-0.5"
              title={isTimerRunning ? 'Pause match timer' : 'Resume match timer'}
            >
              {isTimerRunning ? <Pause className="w-3 h-3 text-amber-600" /> : <Play className="w-3 h-3 text-emerald-600" />}
            </button>
          </div>
        </div>

        {/* Referee Actions: Deuce & Custom Winner & Flow Log */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Deuce Button */}
          <button
            onClick={onOpenDeuceModal}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all shadow-sm active:scale-95 ${
              isDeuce
                ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30'
                : 'bg-cream-100 hover:bg-cream-200 text-ink border-cream-300'
            }`}
            title="Configure or Trigger Deuce rules"
          >
            <Split className="w-4 h-4 text-shuttle-amber" />
            <span>{isDeuce ? 'Deuce Active' : 'Deuce Control'}</span>
          </button>

          {/* Operator Custom Winner Button */}
          <button
            onClick={onOpenCustomWinnerModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-shuttle-forest to-shuttle-emerald text-cream-50 hover:brightness-105 active:scale-95 transition-all shadow-sm shadow-shuttle-emerald/20"
            title="Operator Manual Winner Override"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Custom Winner</span>
          </button>

          {/* Score Flow Log Toggle */}
          <button
            onClick={onToggleScoreLog}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all shadow-sm active:scale-95 ${
              isLogOpen
                ? 'bg-cream-300 text-ink border-cream-400'
                : 'bg-cream-100 hover:bg-cream-200 text-ink border-cream-300'
            }`}
            title="Toggle Score Timeline Log"
          >
            <ListOrdered className="w-4 h-4 text-shuttle-forest" />
            <span>Score Flow</span>
            {logCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cream-200 text-ink">
                {logCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
