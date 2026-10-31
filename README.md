# ShuttleScore — Badminton Counter & Umpire Scoreboard

> A badminton scoring web app featuring an aesthetic **Cream Theme**, tactile courtside scoring, official BWF deuce mechanics, referee custom winner overrides, multi-level undo, live score flow logs, and **Supabase** persistence. Ready for instant deployment to **Vercel**.

---

## Features

- **Warm Cream Aesthetic Theme**: Styled with ivory, warm cream (`#F7F3EB`), forest green tournament accents, and typography tailored for courtside visibility.
- **Match Setup**:
  - Configure Team 1 & Team 2 (or Player names).
  - Target points per set (21 BWF standard, 15, 11, or custom).
  - Match formats (Singles or Doubles).
  - Best of 1, 3, or 5 sets.
  - Toss server selection.
- **Tactile Scoring**:
  - Tap anywhere on a team card to score (+1).
  - Quick `-1` decrement button for slight corrections.
  - Dynamic **Game Point**, **Match Point**, and **Deuce** badges.
  - Automatic court swap after each set or manual swap anytime.
- **Badminton Service Rules & 2D Court Visualizer**:
  - Automatically identifies whether the server serves from the **Right Court** (Even points) or **Left Court** (Odd points).
  - Interactive 2D court diagram illustrating active server and receiver service boxes.
- **Full Undo / Redo**:
  - Instant undo button (`Z` or `Ctrl+Z`) and redo (`Y` or `Ctrl+Y`).
  - Safe state rollbacks so misclicks can never spoil a match.
- **Referee Deuce & Custom Winner Controls**:
  - **Deuce Mode**: Triggers standard BWF win-by-2 rules or sudden death golden point ceiling (up to 30 points).
  - **Custom Winner Override**: Allows the operator to award the match to either team immediately with official reasons (*Referee Decision*, *Opponent Retired*, *Disqualification*, *Walkover*).
- **Match Score Flow Log**:
  - Detailed point-by-point timeline recording the timestamp, scoring team, running score, and match intervals.
  - 1-click button to copy full match report to clipboard.
- **Built-in Synthesizer Audio Cues**:
  - Racket impact sound, referee whistle on game/match points, and victory fanfare (runs on Web Audio API — 0 external audio dependencies, works offline).
- **Supabase Cloud Database & Offline Fallback**:
  - Stores all completed match records, set breakdowns, and score flow logs in Supabase `matches` table.
  - Graceful offline fallback to LocalStorage if Supabase credentials are not yet entered.
  - In-app Supabase test connection and 1-click schema generator.

---

## Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

---

## Supabase Database Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** > **New Query**, paste the contents of [`supabase_schema.sql`](file:///c:/Users/Satwik_G.J/OneDrive/Desktop/couter/supabase_schema.sql), and click **Run**.
3. Copy your **Project URL** and **anon public key** from *Project Settings > API*.
4. You can either:
   - Enter them directly into the app by clicking the **Supabase** icon in the top navigation bar.
   - Or create a `.env` file:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

---

## Push to Vercel Fast

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy directly from this directory
vercel
```

### Option B: Push to GitHub & Connect to Vercel
```bash
git add .
git commit -m "feat: shuttlescore badminton counter webapp"
git remote add origin https://github.com/YOUR_USERNAME/shuttlescore.git
git push -u origin main
```
1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository.
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key
4. Click **Deploy**.

---

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `1` or `←` | Score point for Team 1 (Left side) |
| `2` or `→` | Score point for Team 2 (Right side) |
| `Z` or `Ctrl+Z` | Undo last point / referee action |
| `Y` or `Ctrl+Y` | Redo action |
| `S` | Swap court sides |
| `D` | Open Deuce & Tiebreak controls |
| `W` | Declare Custom Winner override |
| `L` | Toggle Score Flow log panel |
| `Space` | Pause / Resume match timer |
| `?` | Show keyboard shortcuts |
