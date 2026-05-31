/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#070b14',
          surface: '#0d1526',
          border: '#1a2a45',
          gold: '#f0a22a',
          'gold-dim': '#b07818',
          cyan: '#00d4ff',
          green: '#00ff88',
          red: '#ff3d5a',
          purple: '#a855f7',
          orange: '#f97316',
          text: '#c8d8f0',
          muted: '#6b7fa3',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Bebas Neue', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
