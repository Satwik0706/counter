-- ==============================================================================
-- ShuttleScore Badminton Counter — Supabase Database Schema
-- Run this in your Supabase Project's SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  team1_name TEXT NOT NULL,
  team2_name TEXT NOT NULL,
  team1_players TEXT[] DEFAULT '{}',
  team2_players TEXT[] DEFAULT '{}',
  match_format TEXT NOT NULL DEFAULT 'singles', -- 'singles' | 'doubles'
  target_points INT NOT NULL DEFAULT 21,
  total_sets INT NOT NULL DEFAULT 1,
  sets_won_team1 INT NOT NULL DEFAULT 0,
  sets_won_team2 INT NOT NULL DEFAULT 0,
  winner_team INT, -- 1 or 2
  winner_name TEXT,
  win_reason TEXT DEFAULT 'normal', -- 'normal' | 'deuce_won' | 'operator_override' | 'opponent_retired'
  scores JSONB NOT NULL DEFAULT '[]'::jsonb, 
  -- e.g. [{"set": 1, "team1": 21, "team2": 19, "winner": 1}]
  score_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Point-by-point timeline logs
  duration_seconds INT DEFAULT 0,
  is_deuce_played BOOLEAN DEFAULT false,
  notes TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous read & insert access (perfect for fast scoreboard apps)
DROP POLICY IF EXISTS "Public can view matches" ON matches;
CREATE POLICY "Public can view matches"
  ON matches FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can insert matches" ON matches;
CREATE POLICY "Public can insert matches"
  ON matches FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete matches" ON matches;
CREATE POLICY "Public can delete matches"
  ON matches FOR DELETE
  USING (true);

-- Helpful index for chronological match sorting
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);
