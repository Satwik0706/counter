/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F5EFE6',
          200: '#ECE3D4',
          300: '#DECDB6',
          400: '#C8B294',
          500: '#A68D6E',
          600: '#7F6950',
          700: '#5C4A37',
          800: '#3D3023',
          900: '#231B13',
          card: '#FFFDF9',
          court: '#F2EBD9',
        },
        shuttle: {
          forest: '#26533A',
          emerald: '#2D6A4F',
          clay: '#C2593F',
          amber: '#D97706',
          gold: '#B45309',
        },
        ink: {
          DEFAULT: '#221E1B',
          soft: '#4A433D',
          muted: '#736B63',
          faint: '#A69E96',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'cream-sm': '0 2px 8px -2px rgba(166, 141, 110, 0.15)',
        'cream-md': '0 8px 24px -4px rgba(166, 141, 110, 0.18)',
        'cream-lg': '0 16px 36px -6px rgba(166, 141, 110, 0.22)',
        'score-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
