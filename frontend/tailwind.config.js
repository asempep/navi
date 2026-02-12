/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // 모바일 기준 뷰포트 1179 × 2556 (width × height)
      screens: {
        mobile: '1180px',           // 1180px 이상에서 적용 (min-width)
        'max-mobile': { max: '1179px' },  // 1179px 이하에서 적용 (max-width)
      },
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
