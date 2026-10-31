import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  History, 
  Database, 
  HelpCircle, 
  RotateCcw,
  LayoutGrid
} from 'lucide-react';
import { MatchConfig } from '../types';

interface NavbarProps {
  config: MatchConfig;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  onOpenSupabase: () => void;
  onOpenShortcuts: () => void;
  onOpenSetup: () => void;
  onResetMatch: () => void;
  supabaseConnected: boolean;
  showCourt: boolean;
  onToggleCourt: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  soundEnabled,
  onToggleSound,
  onOpenHistory,
  onOpenSupabase,
  onOpenShortcuts,
  onOpenSetup,
  onResetMatch,
  supabaseConnected,
  showCourt,
  onToggleCourt,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-cream-50/90 backdrop-blur-md border-b border-cream-200 px-3 sm:px-6 py-2.5 shadow-cream-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Match Info */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenSetup}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
            title="Match Settings"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-shuttle-emerald to-shuttle-forest flex items-center justify-center text-cream-50 shadow-sm shadow-shuttle-forest/20 group-hover:ring-2 ring-shuttle-emerald/40 transition-all">
              <span className="text-xl">🏸</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-lg text-ink tracking-tight">ShuttleScore</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cream-200 text-ink-soft border border-cream-300">
                  Umpire
                </span>
              </div>
              <p className="text-xs text-ink-muted font-medium truncate max-w-[150px] sm:max-w-[260px]">
                {config.team1Name} vs {config.team2Name} • {config.targetPoints} pts
              </p>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Court toggle */}
          <button
            onClick={onToggleCourt}
            className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              showCourt 
                ? 'bg-shuttle-emerald text-cream-50 border-shuttle-forest shadow-sm' 
                : 'bg-cream-100 hover:bg-cream-200 text-ink-soft border-cream-300'
            }`}
            title="Toggle 2D Court Visualizer"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden md:inline">Court</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-soft border border-cream-300 transition-all"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-shuttle-forest" /> : <VolumeX className="w-4 h-4 text-ink-faint" />}
          </button>

          {/* Supabase Status Pill */}
          <button
            onClick={onOpenSupabase}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 bg-cream-100 hover:bg-cream-200 text-ink-soft border-cream-300 transition-all"
            title="Supabase Database Settings"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${supabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="hidden sm:inline">{supabaseConnected ? 'Supabase' : 'SupaBase'}</span>
            </span>
          </button>

          {/* Match History */}
          <button
            onClick={onOpenHistory}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 bg-cream-100 hover:bg-cream-200 text-ink-soft border-cream-300 transition-all"
            title="Saved Match History"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>

          {/* New Match / Reset */}
          <button
            onClick={onResetMatch}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1 bg-cream-200 hover:bg-cream-300 text-ink border-cream-300 transition-all"
            title="Reset or Configure Match"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </button>

          {/* Shortcuts Help */}
          <button
            onClick={onOpenShortcuts}
            className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-muted border border-cream-300 transition-all"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
