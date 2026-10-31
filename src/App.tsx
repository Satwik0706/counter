import { useState, useEffect, useCallback } from 'react';
import { 
  MatchConfig, 
  PointLog, 
  SetScore, 
  MatchSnapshot, 
  SavedMatch, 
  WinReason,
  CourtPosition 
} from './types';
import { Navbar } from './components/Navbar';
import { ScoreBoard } from './components/ScoreBoard';
import { RefereeControlBar } from './components/RefereeControlBar';
import { ScoreFlowLog } from './components/ScoreFlowLog';
import { CourtVisualizer } from './components/CourtVisualizer';
import { MatchSetupModal } from './components/MatchSetupModal';
import { CustomWinnerModal } from './components/CustomWinnerModal';
import { DeuceModal } from './components/DeuceModal';
import { WinnerCelebrationModal } from './components/WinnerCelebrationModal';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { sound } from './lib/audio';
import { getSupabaseConfig } from './lib/supabase';
import { persistMatch } from './lib/storage';

const DEFAULT_CONFIG: MatchConfig = {
  team1Name: 'Team Alpha',
  team2Name: 'Team Beta',
  team1Players: ['Player 1'],
  team2Players: ['Player 2'],
  targetPoints: 21,
  maxSets: 3,
  matchFormat: 'singles',
  deuceEnabled: true,
  goldenPointCap: 30,
  initialServer: 1,
};

export function App() {
  // Configuration
  const [config, setConfig] = useState<MatchConfig>(DEFAULT_CONFIG);

  // Match Scoring State
  const [team1Points, setTeam1Points] = useState<number>(0);
  const [team2Points, setTeam2Points] = useState<number>(0);
  const [team1SetsWon, setTeam1SetsWon] = useState<number>(0);
  const [team2SetsWon, setTeam2SetsWon] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [setScores, setSetScores] = useState<SetScore[]>([]);

  // Badminton Service State
  const [servingTeam, setServingTeam] = useState<1 | 2>(1);
  const [swappedSides, setSwappedSides] = useState<boolean>(false);
  const [isDeuce, setIsDeuce] = useState<boolean>(false);

  // Match Status
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [winnerTeam, setWinnerTeam] = useState<1 | 2 | null>(null);
  const [winReason, setWinReason] = useState<WinReason | null>(null);
  const [savedToSupabase, setSavedToSupabase] = useState<boolean>(false);

  // History & Undo/Redo Stack
  const [history, setHistory] = useState<MatchSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<MatchSnapshot[]>([]);
  const [logs, setLogs] = useState<PointLog[]>([]);

  // Match Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Modals & Panels
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isCustomWinnerOpen, setIsCustomWinnerOpen] = useState<boolean>(false);
  const [isDeuceModalOpen, setIsDeuceModalOpen] = useState<boolean>(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  const [showCourt, setShowCourt] = useState<boolean>(true);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.isSoundEnabled());
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(getSupabaseConfig().isConfigured);

  // Timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && !isFinished) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isFinished]);

  // Snapshot generator for undo
  const takeSnapshot = useCallback((): MatchSnapshot => {
    const serverPts = servingTeam === 1 ? team1Points : team2Points;
    const serverPosition: CourtPosition = serverPts % 2 === 0 ? 'right' : 'left';
    return {
      team1Points,
      team2Points,
      team1SetsWon,
      team2SetsWon,
      currentSet,
      servingTeam,
      serverPosition,
      isDeuce,
      isFinished,
      winnerTeam,
      winReason,
      setScores: [...setScores],
      logs: [...logs],
    };
  }, [
    team1Points,
    team2Points,
    team1SetsWon,
    team2SetsWon,
    currentSet,
    servingTeam,
    isDeuce,
    isFinished,
    winnerTeam,
    winReason,
    setScores,
    logs,
  ]);

  // Check and save finalized match
  const finalizeMatch = useCallback(async (
    winningTeam: 1 | 2, 
    reason: WinReason, 
    overrideSetsWon1?: number,
    overrideSetsWon2?: number,
    finalSetScores?: SetScore[]
  ) => {
    setIsFinished(true);
    setWinnerTeam(winningTeam);
    setWinReason(reason);
    setIsTimerRunning(false);

    sound.playVictory();

    const wName = winningTeam === 1 ? config.team1Name : config.team2Name;
    const sWon1 = overrideSetsWon1 !== undefined ? overrideSetsWon1 : team1SetsWon;
    const sWon2 = overrideSetsWon2 !== undefined ? overrideSetsWon2 : team2SetsWon;
    const scores = finalSetScores || setScores;

    const savedMatch: SavedMatch = {
      id: crypto.randomUUID ? crypto.randomUUID() : `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
      team1_name: config.team1Name,
      team2_name: config.team2Name,
      team1_players: config.team1Players,
      team2_players: config.team2Players,
      match_format: config.matchFormat,
      target_points: config.targetPoints,
      total_sets: config.maxSets,
      sets_won_team1: sWon1,
      sets_won_team2: sWon2,
      winner_team: winningTeam,
      winner_name: wName,
      win_reason: reason,
      scores,
      score_logs: logs,
      duration_seconds: elapsedSeconds,
      is_deuce_played: isDeuce || logs.some(l => l.isDeucePoint),
    };

    const persistRes = await persistMatch(savedMatch);
    setSavedToSupabase(persistRes.savedToSupabase);
    setIsCelebrationOpen(true);
  }, [config, team1SetsWon, team2SetsWon, setScores, logs, elapsedSeconds, isDeuce]);

  // Handle rally score increment
  const handleScorePoint = useCallback((scoringTeam: 1 | 2) => {
    if (isFinished) return;

    // Start timer on first point if not running
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }

    // Push to undo history stack
    const snapshot = takeSnapshot();
    setHistory(prev => [...prev, snapshot]);
    setRedoStack([]); // Clear redo stack on new action

    sound.playShuttleHit();

    const newTeam1Points = scoringTeam === 1 ? team1Points + 1 : team1Points;
    const newTeam2Points = scoringTeam === 2 ? team2Points + 1 : team2Points;

    const currentPoints = scoringTeam === 1 ? newTeam1Points : newTeam2Points;
    const opponentPoints = scoringTeam === 1 ? newTeam2Points : newTeam1Points;

    // Determine court position for log
    const serverPts = scoringTeam === 1 ? newTeam1Points : newTeam2Points;
    const serverPosition: CourtPosition = serverPts % 2 === 0 ? 'right' : 'left';

    // Check Deuce conditions
    const target = config.targetPoints;
    const cap = config.goldenPointCap || target + 9;
    const isTiedAtDeuceThreshold = config.deuceEnabled && (newTeam1Points >= target - 1 && newTeam2Points >= target - 1 && newTeam1Points === newTeam2Points);

    let nextDeuce = isDeuce;
    if (isTiedAtDeuceThreshold) {
      nextDeuce = true;
      sound.playWhistle(false);
    }

    // Check set win condition:
    // 1. Reached golden point cap (e.g. 30 in 21 pt match) -> immediate set win!
    // 2. Reached target or above with at least 2 point lead (if deuce enabled)
    // 3. Reached target without deuce enabled
    let setWon = false;
    let setWinReason: WinReason = 'points_reached';

    if (currentPoints >= cap) {
      setWon = true;
      setWinReason = 'deuce_won';
    } else if (config.deuceEnabled && (nextDeuce || currentPoints >= target)) {
      if (currentPoints >= target && (currentPoints - opponentPoints >= 2)) {
        setWon = true;
        setWinReason = nextDeuce ? 'deuce_won' : 'points_reached';
      }
    } else if (!config.deuceEnabled && currentPoints >= target) {
      setWon = true;
      setWinReason = 'points_reached';
    }

    // Create point log entry
    const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
    const newLog: PointLog = {
      id: `pt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: `${mins}:${secs}`,
      elapsedSeconds,
      setNumber: currentSet,
      scoringTeam,
      score1: newTeam1Points,
      score2: newTeam2Points,
      serverTeam: scoringTeam, // In badminton, rally winner gets service
      serverPosition,
      isDeucePoint: nextDeuce,
      note: setWon ? `Won Set ${currentSet}` : (isTiedAtDeuceThreshold ? 'Deuce called' : undefined),
    };

    setLogs(prev => [...prev, newLog]);
    setServingTeam(scoringTeam);
    setIsDeuce(nextDeuce);

    if (setWon) {
      // Set completed!
      const newScoreRecord: SetScore = {
        setNumber: currentSet,
        team1Score: newTeam1Points,
        team2Score: newTeam2Points,
        winner: scoringTeam,
        durationSeconds: elapsedSeconds,
      };

      const updatedSetScores = [...setScores, newScoreRecord];
      setSetScores(updatedSetScores);

      const nextSetsWon1 = scoringTeam === 1 ? team1SetsWon + 1 : team1SetsWon;
      const nextSetsWon2 = scoringTeam === 2 ? team2SetsWon + 1 : team2SetsWon;
      setTeam1SetsWon(nextSetsWon1);
      setTeam2SetsWon(nextSetsWon2);

      // Check Match Win (e.g. Best of 3 -> need 2 sets)
      const setsNeeded = Math.ceil(config.maxSets / 2);
      if (nextSetsWon1 >= setsNeeded || nextSetsWon2 >= setsNeeded) {
        // Whole match won!
        setTeam1Points(newTeam1Points);
        setTeam2Points(newTeam2Points);
        finalizeMatch(scoringTeam, setWinReason, nextSetsWon1, nextSetsWon2, updatedSetScores);
      } else {
        // Prepare next set!
        sound.playWhistle(true);
        setCurrentSet(prev => prev + 1);
        setTeam1Points(0);
        setTeam2Points(0);
        setIsDeuce(false);
        // Standard badminton court switch after each set
        setSwappedSides(prev => !prev);
      }
    } else {
      // Regular point increment
      setTeam1Points(newTeam1Points);
      setTeam2Points(newTeam2Points);

      // Whistle audio cue if game point or match point
      const isGamePt = currentPoints === target - 1 && currentPoints > opponentPoints;
      if (isGamePt) {
        sound.playWhistle(false);
      }
    }
  }, [
    isFinished,
    isTimerRunning,
    takeSnapshot,
    team1Points,
    team2Points,
    config,
    isDeuce,
    elapsedSeconds,
    currentSet,
    setScores,
    team1SetsWon,
    team2SetsWon,
    finalizeMatch,
  ]);

  // Handle -1 decrement for corrections
  const handleDecrement = useCallback((team: 1 | 2) => {
    if (isFinished) return;
    const current = team === 1 ? team1Points : team2Points;
    if (current <= 0) return;

    const snapshot = takeSnapshot();
    setHistory(prev => [...prev, snapshot]);
    setRedoStack([]);

    sound.playUndo();

    if (team === 1) {
      setTeam1Points(prev => Math.max(0, prev - 1));
    } else {
      setTeam2Points(prev => Math.max(0, prev - 1));
    }
  }, [isFinished, team1Points, team2Points, takeSnapshot]);

  // Undo last action
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    sound.playUndo();

    const previous = history[history.length - 1];
    const currentSnapshot = takeSnapshot();

    setRedoStack(prev => [...prev, currentSnapshot]);
    setHistory(prev => prev.slice(0, -1));

    // Restore state from snapshot
    setTeam1Points(previous.team1Points);
    setTeam2Points(previous.team2Points);
    setTeam1SetsWon(previous.team1SetsWon);
    setTeam2SetsWon(previous.team2SetsWon);
    setCurrentSet(previous.currentSet);
    setServingTeam(previous.servingTeam);
    setIsDeuce(previous.isDeuce);
    setIsFinished(previous.isFinished);
    setWinnerTeam(previous.winnerTeam);
    setWinReason(previous.winReason);
    setSetScores(previous.setScores);
    setLogs(previous.logs);

    if (isCelebrationOpen && !previous.isFinished) {
      setIsCelebrationOpen(false);
    }
  }, [history, takeSnapshot, isCelebrationOpen]);

  // Redo undone action
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;

    sound.playShuttleHit();

    const next = redoStack[redoStack.length - 1];
    const currentSnapshot = takeSnapshot();

    setHistory(prev => [...prev, currentSnapshot]);
    setRedoStack(prev => prev.slice(0, -1));

    setTeam1Points(next.team1Points);
    setTeam2Points(next.team2Points);
    setTeam1SetsWon(next.team1SetsWon);
    setTeam2SetsWon(next.team2SetsWon);
    setCurrentSet(next.currentSet);
    setServingTeam(next.servingTeam);
    setIsDeuce(next.isDeuce);
    setIsFinished(next.isFinished);
    setWinnerTeam(next.winnerTeam);
    setWinReason(next.winReason);
    setSetScores(next.setScores);
    setLogs(next.logs);

    if (next.isFinished) {
      setIsCelebrationOpen(true);
    }
  }, [redoStack, takeSnapshot]);

  // Operator Custom Winner Declaration
  const handleCustomWinner = useCallback((winningTeam: 1 | 2, reason: WinReason, notes?: string) => {
    const snapshot = takeSnapshot();
    setHistory(prev => [...prev, snapshot]);

    const sWon1 = winningTeam === 1 ? Math.max(team1SetsWon, Math.ceil(config.maxSets / 2)) : team1SetsWon;
    const sWon2 = winningTeam === 2 ? Math.max(team2SetsWon, Math.ceil(config.maxSets / 2)) : team2SetsWon;

    setTeam1SetsWon(sWon1);
    setTeam2SetsWon(sWon2);

    // Add note to log
    const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
    const decisionLog: PointLog = {
      id: `decision_${Date.now()}`,
      timestamp: `${mins}:${secs}`,
      elapsedSeconds,
      setNumber: currentSet,
      scoringTeam: winningTeam,
      score1: team1Points,
      score2: team2Points,
      serverTeam: winningTeam,
      serverPosition: 'right',
      note: `Referee Decision: Awarded to ${winningTeam === 1 ? config.team1Name : config.team2Name} (${reason}${notes ? ` - ${notes}` : ''})`,
    };

    setLogs(prev => [...prev, decisionLog]);
    finalizeMatch(winningTeam, reason, sWon1, sWon2);
  }, [takeSnapshot, team1SetsWon, team2SetsWon, config, elapsedSeconds, currentSet, team1Points, team2Points, finalizeMatch]);

  // Start new match
  const handleStartNewMatch = (newConfig: MatchConfig) => {
    setConfig(newConfig);
    setTeam1Points(0);
    setTeam2Points(0);
    setTeam1SetsWon(0);
    setTeam2SetsWon(0);
    setCurrentSet(1);
    setSetScores([]);
    setServingTeam(newConfig.initialServer);
    setSwappedSides(false);
    setIsDeuce(false);
    setIsFinished(false);
    setWinnerTeam(null);
    setWinReason(null);
    setHistory([]);
    setRedoStack([]);
    setLogs([]);
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    setIsCelebrationOpen(false);
  };

  // Rematch with same players
  const handleRematch = () => {
    handleStartNewMatch(config);
  };

  // Reset current match prompt
  const handleResetMatch = () => {
    if (team1Points > 0 || team2Points > 0 || setScores.length > 0) {
      if (window.confirm('Reset current match scores to 0-0?')) {
        handleStartNewMatch(config);
      }
    } else {
      setIsSetupOpen(true);
    }
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    sound.setSoundEnabled(next);
    setSoundEnabled(next);
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        // Check if swapped
        const teamToScore = swappedSides ? 2 : 1;
        handleScorePoint(teamToScore);
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        const teamToScore = swappedSides ? 1 : 2;
        handleScorePoint(teamToScore);
      } else if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey || !e.ctrlKey)) {
        if (e.key === 'z' && e.ctrlKey && e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.key === 'y' || e.key === 'Y') && (e.ctrlKey || e.metaKey || !e.ctrlKey)) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSwappedSides(prev => !prev);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setIsDeuceModalOpen(true);
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setIsCustomWinnerOpen(true);
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setIsLogOpen(prev => !prev);
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsTimerRunning(prev => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [swappedSides, handleScorePoint, handleUndo, handleRedo]);

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col font-sans selection:bg-cream-300 selection:text-ink">
      {/* Top Header Navbar */}
      <Navbar
        config={config}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSetup={() => setIsSetupOpen(true)}
        onResetMatch={handleResetMatch}
        supabaseConnected={supabaseConnected}
        showCourt={showCourt}
        onToggleCourt={() => setShowCourt(prev => !prev)}
      />

      {/* Main Scoring Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-4">
        {/* Supabase offline banner if not configured yet */}
        {!supabaseConnected && (
          <div className="px-4 py-2.5 rounded-2xl bg-cream-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2 shadow-cream-sm">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <span>
                <strong>Offline-ready Mode:</strong> Matches are stored locally. Connect your Supabase database in 1 click to sync older match results!
              </span>
            </div>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-3 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold transition-colors shrink-0"
            >
              Connect Supabase
            </button>
          </div>
        )}

        {/* 2D Badminton Court Visualizer (Toggleable) */}
        {showCourt && (
          <CourtVisualizer
            config={config}
            team1Points={team1Points}
            team2Points={team2Points}
            servingTeam={servingTeam}
            serverPosition={servingTeam === 1 ? (team1Points % 2 === 0 ? 'right' : 'left') : (team2Points % 2 === 0 ? 'right' : 'left')}
            swappedSides={swappedSides}
          />
        )}

        {/* Central Dual Scoreboard */}
        <ScoreBoard
          config={config}
          team1Points={team1Points}
          team2Points={team2Points}
          team1SetsWon={team1SetsWon}
          team2SetsWon={team2SetsWon}
          currentSet={currentSet}
          setScores={setScores}
          servingTeam={servingTeam}
          isDeuce={isDeuce}
          swappedSides={swappedSides}
          onIncrementTeam={handleScorePoint}
          onDecrementTeam={handleDecrement}
          onSetServer={setServingTeam}
          onSwapSides={() => setSwappedSides(prev => !prev)}
        />

        {/* Referee Controls Bar: Undo, Deuce, Custom Winner, Flow Log */}
        <RefereeControlBar
          canUndo={history.length > 0}
          canRedo={redoStack.length > 0}
          undoCount={history.length}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onOpenDeuceModal={() => setIsDeuceModalOpen(true)}
          onOpenCustomWinnerModal={() => setIsCustomWinnerOpen(true)}
          onToggleScoreLog={() => setIsLogOpen(prev => !prev)}
          isLogOpen={isLogOpen}
          logCount={logs.length}
          elapsedSeconds={elapsedSeconds}
          isTimerRunning={isTimerRunning}
          onToggleTimer={() => setIsTimerRunning(prev => !prev)}
          isDeuce={isDeuce}
        />

        {/* Score Flow Timeline Drawer */}
        <ScoreFlowLog
          logs={logs}
          config={config}
          isOpen={isLogOpen}
          onClose={() => setIsLogOpen(false)}
        />
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 text-center text-xs text-ink-muted border-t border-cream-200 bg-cream-50/60">
        <p>
          🏸 ShuttleScore — Aesthetic Cream Badminton Scoreboard • Ready for Vercel & Supabase
        </p>
      </footer>

      {/* Modals */}
      <MatchSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        initialConfig={config}
        onStartMatch={handleStartNewMatch}
      />

      <CustomWinnerModal
        isOpen={isCustomWinnerOpen}
        onClose={() => setIsCustomWinnerOpen(false)}
        config={config}
        team1Score={team1Points}
        team2Score={team2Points}
        onConfirmWinner={handleCustomWinner}
      />

      <DeuceModal
        isOpen={isDeuceModalOpen}
        onClose={() => setIsDeuceModalOpen(false)}
        config={config}
        isDeuce={isDeuce}
        onToggleDeuce={(val) => setIsDeuce(val)}
        onSetGoldenCap={(cap) => setConfig(prev => ({ ...prev, goldenPointCap: cap }))}
        onOpenCustomWinner={() => setIsCustomWinnerOpen(true)}
      />

      {isFinished && winnerTeam && winReason && (
        <WinnerCelebrationModal
          isOpen={isCelebrationOpen}
          onClose={() => setIsCelebrationOpen(false)}
          winnerTeam={winnerTeam}
          winnerName={winnerTeam === 1 ? config.team1Name : config.team2Name}
          winReason={winReason}
          config={config}
          setScores={setScores}
          team1SetsWon={team1SetsWon}
          team2SetsWon={team2SetsWon}
          elapsedSeconds={elapsedSeconds}
          savedToSupabase={savedToSupabase}
          onNewMatch={() => {
            setIsCelebrationOpen(false);
            setIsSetupOpen(true);
          }}
          onRematch={() => {
            setIsCelebrationOpen(false);
            handleRematch();
          }}
          onViewScoreFlow={() => {
            setIsCelebrationOpen(false);
            setIsLogOpen(true);
          }}
        />
      )}

      <MatchHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={() => {
          setSupabaseConnected(getSupabaseConfig().isConfigured);
        }}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
export default App;
