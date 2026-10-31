import React from 'react';
import { 
  Plus, 
  Minus, 
  ArrowLeftRight, 
  Award, 
  Flame
} from 'lucide-react';
import { MatchConfig, SetScore } from '../types';

interface ScoreBoardProps {
  config: MatchConfig;
  team1Points: number;
  team2Points: number;
  team1SetsWon: number;
  team2SetsWon: number;
  currentSet: number;
  setScores: SetScore[];
  servingTeam: 1 | 2;
  isDeuce: boolean;
  swappedSides: boolean;
  onIncrementTeam: (team: 1 | 2) => void;
  onDecrementTeam: (team: 1 | 2) => void;
  onSetServer: (team: 1 | 2) => void;
  onSwapSides: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  config,
  team1Points,
  team2Points,
  team1SetsWon,
  team2SetsWon,
  currentSet,
  setScores,
  servingTeam,
  isDeuce,
  swappedSides,
  onIncrementTeam,
  onDecrementTeam,
  onSetServer,
  onSwapSides,
}) => {
  // Target points to win current set
  const target = config.targetPoints;
  const isMatchPointTeam1 = 
    (team1Points >= target - 1 && team1Points > team2Points) &&
    (team1SetsWon + 1 > config.maxSets / 2);
  const isMatchPointTeam2 = 
    (team2Points >= target - 1 && team2Points > team1Points) &&
    (team2SetsWon + 1 > config.maxSets / 2);

  const isGamePointTeam1 = !isMatchPointTeam1 && (team1Points >= target - 1 && team1Points > team2Points);
  const isGamePointTeam2 = !isMatchPointTeam2 && (team2Points >= target - 1 && team2Points > team1Points);

  // Left & Right Team assignments based on swappedSides
  const leftTeamId: 1 | 2 = swappedSides ? 2 : 1;
  const rightTeamId: 1 | 2 = swappedSides ? 1 : 2;

  const leftTeamName = leftTeamId === 1 ? config.team1Name : config.team2Name;
  const rightTeamName = rightTeamId === 1 ? config.team1Name : config.team2Name;

  const leftPoints = leftTeamId === 1 ? team1Points : team2Points;
  const rightPoints = rightTeamId === 1 ? team1Points : team2Points;

  const leftSets = leftTeamId === 1 ? team1SetsWon : team2SetsWon;
  const rightSets = rightTeamId === 1 ? team1SetsWon : team2SetsWon;

  const isLeftServing = servingTeam === leftTeamId;
  const isRightServing = servingTeam === rightTeamId;

  const leftGamePoint = leftTeamId === 1 ? isGamePointTeam1 : isGamePointTeam2;
  const rightGamePoint = rightTeamId === 1 ? isGamePointTeam1 : isGamePointTeam2;

  const leftMatchPoint = leftTeamId === 1 ? isMatchPointTeam1 : isMatchPointTeam2;
  const rightMatchPoint = rightTeamId === 1 ? isMatchPointTeam1 : isMatchPointTeam2;

  const renderTeamCard = (
    teamId: 1 | 2,
    teamName: string,
    points: number,
    setsWon: number,
    isServing: boolean,
    isGamePoint: boolean,
    isMatchPoint: boolean,
    side: 'left' | 'right'
  ) => {
    // Badminton service court: Even score = Right court, Odd score = Left court
    const serviceCourt = points % 2 === 0 ? 'Right' : 'Left';

    return (
      <div 
        className={`relative flex-1 flex flex-col justify-between rounded-3xl p-5 sm:p-7 transition-all duration-200 border-2 ${
          isServing 
            ? 'bg-gradient-to-b from-cream-card via-cream-card to-cream-100/60 border-shuttle-emerald/60 shadow-cream-md ring-4 ring-shuttle-emerald/10' 
            : 'bg-cream-card border-cream-200/90 shadow-cream-sm hover:border-cream-300'
        }`}
      >
        {/* Top bar: Serving indicator & Status Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {isServing ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-shuttle-emerald text-cream-50 shadow-sm animate-pulse">
                <span>🏸</span>
                <span>SERVING ({serviceCourt.toUpperCase()})</span>
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetServer(teamId);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-ink-muted bg-cream-100 hover:bg-cream-200 border border-cream-300 transition-colors"
                title="Handover service to this team"
              >
                Pass Serve
              </button>
            )}

            {isMatchPoint && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-shuttle-clay text-cream-50 animate-bounce shadow-sm">
                <Flame className="w-3.5 h-3.5" />
                MATCH POINT
              </span>
            )}

            {isGamePoint && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-shuttle-amber text-cream-50 shadow-sm">
                <Award className="w-3.5 h-3.5" />
                GAME POINT
              </span>
            )}

            {isDeuce && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-cream-300 text-ink-soft">
                DEUCE
              </span>
            )}
          </div>

          {/* Sets counter badge */}
          {config.maxSets > 1 && (
            <div className="flex items-center gap-1 bg-cream-100 px-2.5 py-1 rounded-xl border border-cream-200">
              <span className="text-[11px] font-medium text-ink-muted">Sets:</span>
              <span className="text-xs font-bold font-mono text-ink">{setsWon}</span>
            </div>
          )}
        </div>

        {/* Team / Player Name */}
        <div className="mb-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-ink tracking-tight truncate max-w-[280px]">
              {teamName}
            </h2>
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider hidden sm:inline">
              Side {side === 'left' ? 'A' : 'B'}
            </span>
          </div>
          {/* Subtext info */}
          <p className="text-xs text-ink-muted mt-0.5">
            Tap anywhere on card to score +1
          </p>
        </div>

        {/* Huge Central Score Button Area */}
        <button
          onClick={() => onIncrementTeam(teamId)}
          className="my-3 py-6 sm:py-10 w-full flex items-center justify-center rounded-2xl bg-gradient-to-b from-cream-50 to-cream-100/40 border border-cream-200 shadow-inner group transition-all duration-150 active:scale-[0.98] hover:bg-cream-100/60"
        >
          <div className="text-center">
            <span className="font-mono font-extrabold text-7xl sm:text-8xl lg:text-9xl text-ink tracking-tighter drop-shadow-sm select-none group-hover:scale-105 transition-transform inline-block">
              {points}
            </span>
            <div className="flex items-center justify-center gap-1.5 text-shuttle-emerald font-semibold text-xs mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <Plus className="w-3.5 h-3.5" />
              <span>TAP TO SCORE</span>
            </div>
          </div>
        </button>

        {/* Bottom Actions: -1 Decrement & Quick Info */}
        <div className="flex items-center justify-between pt-2 border-t border-cream-200/80">
          <div className="text-xs text-ink-muted">
            Target: <strong className="text-ink font-semibold">{target}</strong>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDecrementTeam(teamId);
            }}
            disabled={points <= 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-ink-soft bg-cream-100 hover:bg-cream-200 active:bg-cream-300 border border-cream-300 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
            title="Subtract 1 point"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>-1 pt</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Set & Match Info Banner */}
      <div className="flex items-center justify-between px-2 text-xs font-medium text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">Set {currentSet}</span>
          <span>of {config.maxSets}</span>
          {setScores.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-2 border-l border-cream-300">
              <span className="text-[11px] text-ink-faint">Past Sets:</span>
              {setScores.map((s, idx) => (
                <span key={idx} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-cream-200 text-ink font-semibold">
                  {s.team1Score}-{s.team2Score}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Court Swap Button */}
        <button
          onClick={onSwapSides}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cream-100 hover:bg-cream-200 border border-cream-300 text-ink text-xs font-medium transition-all active:scale-95 shadow-sm"
          title="Swap Left & Right court orientation"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-shuttle-emerald" />
          <span>Swap Sides</span>
        </button>
      </div>

      {/* Main Dual Scoreboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {renderTeamCard(
          leftTeamId,
          leftTeamName,
          leftPoints,
          leftSets,
          isLeftServing,
          leftGamePoint,
          leftMatchPoint,
          'left'
        )}

        {renderTeamCard(
          rightTeamId,
          rightTeamName,
          rightPoints,
          rightSets,
          isRightServing,
          rightGamePoint,
          rightMatchPoint,
          'right'
        )}
      </div>
    </div>
  );
};
