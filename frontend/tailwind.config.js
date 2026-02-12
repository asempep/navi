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
          bg: '#152a52',
          card: '#2A508C',
          border: '#3d6ab5',
          text: '#e8eef5',
          muted: '#9ab3d4',
          accent: '#FFFF12',
          win: '#3fb950',
          draw: '#d29922',
          lose: '#f85149',
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
