import React from 'react';
import { CourtPosition, MatchConfig } from '../types';

interface CourtVisualizerProps {
  config: MatchConfig;
  team1Points: number;
  team2Points: number;
  servingTeam: 1 | 2;
  serverPosition: CourtPosition;
  swappedSides: boolean;
}

export const CourtVisualizer: React.FC<CourtVisualizerProps> = ({
  config,
  team1Points,
  team2Points,
  servingTeam,
  swappedSides,
}) => {
  // Determine left-side and right-side teams based on swappedSides
  const leftTeamId = swappedSides ? 2 : 1;
  const rightTeamId = swappedSides ? 1 : 2;

  const leftTeamName = leftTeamId === 1 ? config.team1Name : config.team2Name;
  const rightTeamName = rightTeamId === 1 ? config.team1Name : config.team2Name;

  const leftScore = leftTeamId === 1 ? team1Points : team2Points;
  const rightScore = rightTeamId === 1 ? team1Points : team2Points;

  const isLeftServing = servingTeam === leftTeamId;
  const isRightServing = servingTeam === rightTeamId;

  // Badminton rule:
  // Server serves from Right service court if server score is EVEN,
  // from Left service court if server score is ODD.
  const serverScore = servingTeam === 1 ? team1Points : team2Points;
  const effectiveServerCourt: CourtPosition = (serverScore % 2 === 0) ? 'right' : 'left';

  // In standard court perspective (looking from umpire chair):
  // For the left team:
  // 'right' service court is the lower half of left court
  // 'left' service court is the upper half of left court
  // For the right team (mirrored):
  // 'right' service court is the upper half of right court
  // 'left' service court is the lower half of right court

  return (
    <div className="w-full bg-cream-card rounded-2xl p-3 sm:p-4 border border-cream-200 shadow-cream-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-shuttle-emerald"></span>
          <span className="text-xs font-semibold text-ink uppercase tracking-wider">
            Court Service Position
          </span>
        </div>
        <span className="text-xs font-mono text-ink-muted">
          Server: <strong className="text-shuttle-forest">{servingTeam === 1 ? config.team1Name : config.team2Name}</strong> ({effectiveServerCourt.toUpperCase()} Court • {serverScore % 2 === 0 ? 'Even' : 'Odd'})
        </span>
      </div>

      {/* SVG Badminton Court */}
      <div className="relative w-full aspect-[2.4/1] bg-cream-court rounded-xl border-2 border-cream-400 overflow-hidden shadow-score-inner">
        <svg 
          viewBox="0 0 480 200" 
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Outer Boundary */}
          <rect x="10" y="10" width="460" height="180" fill="#EAE2CF" stroke="#8C7A65" strokeWidth="2.5" />

          {/* Doubles Side Tramlines (top & bottom 15px) */}
          <line x1="10" y1="25" x2="470" y2="25" stroke="#8C7A65" strokeWidth="1.5" strokeDasharray={config.matchFormat === 'singles' ? '3,3' : 'none'} />
          <line x1="10" y1="175" x2="470" y2="175" stroke="#8C7A65" strokeWidth="1.5" strokeDasharray={config.matchFormat === 'singles' ? '3,3' : 'none'} />

          {/* Doubles Long Service Lines (left & right 25px from back line) */}
          <line x1="35" y1="10" x2="35" y2="190" stroke="#8C7A65" strokeWidth="1.5" />
          <line x1="445" y1="10" x2="445" y2="190" stroke="#8C7A65" strokeWidth="1.5" />

          {/* Short Service Lines (45px from net on both sides) */}
          <line x1="195" y1="10" x2="195" y2="190" stroke="#8C7A65" strokeWidth="2" />
          <line x1="285" y1="10" x2="285" y2="190" stroke="#8C7A65" strokeWidth="2" />

          {/* Center Lines */}
          <line x1="10" y1="100" x2="195" y2="100" stroke="#8C7A65" strokeWidth="2" />
          <line x1="285" y1="100" x2="470" y2="100" stroke="#8C7A65" strokeWidth="2" />

          {/* Left Service Box Highlights */}
          {/* Left Top (Left Court) */}
          <rect 
            x="35" y="25" width="160" height="75" 
            fill={isLeftServing && effectiveServerCourt === 'left' ? 'rgba(45, 106, 79, 0.28)' : (!isLeftServing && effectiveServerCourt === 'left' ? 'rgba(217, 119, 6, 0.18)' : 'transparent')}
            className="transition-colors duration-300"
          />
          {/* Left Bottom (Right Court) */}
          <rect 
            x="35" y="100" width="160" height="75" 
            fill={isLeftServing && effectiveServerCourt === 'right' ? 'rgba(45, 106, 79, 0.28)' : (!isLeftServing && effectiveServerCourt === 'right' ? 'rgba(217, 119, 6, 0.18)' : 'transparent')}
            className="transition-colors duration-300"
          />

          {/* Right Service Box Highlights */}
          {/* Right Top (Right Court - diagonal from left bottom) */}
          <rect 
            x="285" y="25" width="160" height="75" 
            fill={isRightServing && effectiveServerCourt === 'right' ? 'rgba(45, 106, 79, 0.28)' : (!isRightServing && effectiveServerCourt === 'right' ? 'rgba(217, 119, 6, 0.18)' : 'transparent')}
            className="transition-colors duration-300"
          />
          {/* Right Bottom (Left Court - diagonal from left top) */}
          <rect 
            x="285" y="100" width="160" height="75" 
            fill={isRightServing && effectiveServerCourt === 'left' ? 'rgba(45, 106, 79, 0.28)' : (!isRightServing && effectiveServerCourt === 'left' ? 'rgba(217, 119, 6, 0.18)' : 'transparent')}
            className="transition-colors duration-300"
          />

          {/* Center NET */}
          <line x1="240" y1="6" x2="240" y2="194" stroke="#221E1B" strokeWidth="4" />
          <line x1="239" y1="6" x2="241" y2="194" stroke="#FFFDF9" strokeWidth="1.5" strokeDasharray="3,3" />
          {/* Net posts */}
          <circle cx="240" cy="8" r="4" fill="#C2593F" />
          <circle cx="240" cy="192" r="4" fill="#C2593F" />

          {/* Shuttlecock Marker on Serving Court */}
          {isLeftServing && (
            <g transform={`translate(${effectiveServerCourt === 'right' ? 115 : 115}, ${effectiveServerCourt === 'right' ? 135 : 60})`}>
              <circle cx="0" cy="0" r="14" fill="#2D6A4F" className="animate-court-pulse" />
              <text x="0" y="4" textAnchor="middle" fontSize="11" fill="#FFFDF9" fontWeight="bold">🏸</text>
            </g>
          )}

          {isRightServing && (
            <g transform={`translate(${effectiveServerCourt === 'right' ? 365 : 365}, ${effectiveServerCourt === 'right' ? 60 : 135})`}>
              <circle cx="0" cy="0" r="14" fill="#2D6A4F" className="animate-court-pulse" />
              <text x="0" y="4" textAnchor="middle" fontSize="11" fill="#FFFDF9" fontWeight="bold">🏸</text>
            </g>
          )}

          {/* Team Label Tags */}
          <text x="45" y="22" fill="#736B63" fontSize="10" fontWeight="bold">
            {leftTeamName.toUpperCase()} ({leftScore})
          </text>
          <text x="435" y="22" textAnchor="end" fill="#736B63" fontSize="10" fontWeight="bold">
            {rightTeamName.toUpperCase()} ({rightScore})
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-ink-muted mt-2 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-shuttle-emerald/40 border border-shuttle-emerald"></span>
          Server Box
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-shuttle-amber/30 border border-shuttle-amber"></span>
          Receiver Box (Diagonal)
        </span>
        <span>{config.matchFormat === 'singles' ? 'Singles Boundaries' : 'Doubles Boundaries'}</span>
      </div>
    </div>
  );
};
