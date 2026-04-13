/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          200: '#b9ccff',
          300: '#83a6ff',
          400: '#4d78ff',
          500: '#2952f5',
          600: '#1a3be8',
          700: '#152fc0',
          800: '#162899',
          900: '#182779',
        },
        surface: {
          900: '#0d0f1a',
          800: '#141624',
          700: '#1c1f30',
          600: '#252840',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'typing 1.5s steps(30, end)',
      },
    },
  },
  plugins: [],
}
