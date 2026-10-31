import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1 or ←', desc: 'Score point for Team 1 (Left)' },
    { key: '2 or →', desc: 'Score point for Team 2 (Right)' },
    { key: 'Z or Ctrl+Z', desc: 'Undo last point / action' },
    { key: 'Y or Ctrl+Y', desc: 'Redo undone action' },
    { key: 'S', desc: 'Swap court sides orientation' },
    { key: 'D', desc: 'Open Deuce & Tiebreak controls' },
    { key: 'W', desc: 'Declare Custom Winner override' },
    { key: 'L', desc: 'Toggle Score Flow Timeline' },
    { key: 'Space', desc: 'Pause / Resume match timer' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-cream-card rounded-3xl p-6 border border-cream-300 shadow-cream-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cream-200 flex items-center justify-center text-ink">
              <Keyboard className="w-5 h-5 text-shuttle-forest" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ink">Keyboard Shortcuts</h3>
              <p className="text-xs text-ink-muted">Umpire rapid-scoring hotkeys</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:bg-cream-200 hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="py-4 space-y-2">
          {shortcuts.map((sc, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-cream-100/60 border border-cream-200"
            >
              <span className="text-xs text-ink font-medium">{sc.desc}</span>
              <kbd className="font-mono text-xs font-bold px-2 py-1 rounded bg-cream-card border border-cream-300 text-ink shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-cream-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cream-200 hover:bg-cream-300 text-ink transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
