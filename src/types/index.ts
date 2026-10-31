export type MatchFormat = 'singles' | 'doubles';

export type CourtPosition = 'left' | 'right';

export interface MatchConfig {
  team1Name: string;
  team2Name: string;
  team1Players: string[];
  team2Players: string[];
  targetPoints: number; // e.g. 21, 15, 11
  maxSets: number; // 1, 3, or 5
  matchFormat: MatchFormat;
  deuceEnabled: boolean;
  goldenPointCap: number; // e.g. 30 in a 21-point game
  initialServer: 1 | 2;
}

export type WinReason = 
  | 'points_reached' 
  | 'deuce_won' 
  | 'operator_override' 
  | 'opponent_retired' 
  | 'disqualification';

export interface PointLog {
  id: string;
  timestamp: string;
  elapsedSeconds: number;
  setNumber: number;
  scoringTeam: 1 | 2;
  score1: number;
  score2: number;
  serverTeam: 1 | 2;
  serverPosition: CourtPosition;
  note?: string;
  isDeucePoint?: boolean;
}

export interface SetScore {
  setNumber: number;
  team1Score: number;
  team2Score: number;
  winner: 1 | 2;
  durationSeconds?: number;
}

export interface MatchSnapshot {
  team1Points: number;
  team2Points: number;
  team1SetsWon: number;
  team2SetsWon: number;
  currentSet: number;
  servingTeam: 1 | 2;
  serverPosition: CourtPosition;
  isDeuce: boolean;
  isFinished: boolean;
  winnerTeam: 1 | 2 | null;
  winReason: WinReason | null;
  setScores: SetScore[];
  logs: PointLog[];
}

export interface SavedMatch {
  id: string;
  created_at: string;
  team1_name: string;
  team2_name: string;
  team1_players?: string[];
  team2_players?: string[];
  match_format: MatchFormat;
  target_points: number;
  total_sets: number;
  sets_won_team1: number;
  sets_won_team2: number;
  winner_team: 1 | 2;
  winner_name: string;
  win_reason: string;
  scores: SetScore[];
  score_logs: PointLog[];
  duration_seconds: number;
  is_deuce_played: boolean;
  notes?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}
