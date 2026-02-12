/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navi: {
          bg: '#ffffff',
          card: '#f8f9fa',
          border: '#dee2e6',
          text: '#152a52',
          muted: '#5a6c7d',
          accent: '#d4af37',
          button: '#152a52',
          win: '#2e7d32',
          draw: '#ed6c02',
          lose: '#c62828',
        },
      },
      fontFamily: {
        sans: ['Noto Sans KR', '-apple-system', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
}
