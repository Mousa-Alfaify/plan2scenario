/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Thmanyah Sans', 'system-ui', 'sans-serif'],
        display: ['Thmanyah Display', 'Thmanyah Sans', 'serif'],
      },
      colors: {
        ink: { DEFAULT: '#12211B', soft: '#3A4A43', mute: '#6B7A73' },
        forest: {
          50: '#F1F6F3', 100: '#DDE9E2', 200: '#BAD3C5', 300: '#8FB6A2',
          400: '#5F927B', 500: '#3E7560', 600: '#2E5C4B', 700: '#24493C',
          800: '#1B382E', 900: '#122620', 950: '#0B1712',
        },
        sand: { 50: '#FCFBF7', 100: '#F6F4EC', 200: '#EDE9DC' },
        gold: { 300: '#DCC38A', 400: '#CBAA63', 500: '#B4903F', 600: '#93742F' },
        stone: {
          50: '#FAFAF9', 100: '#F4F4F2', 200: '#E7E7E3', 300: '#D3D3CD',
          400: '#A8A8A0', 500: '#7C7C74', 600: '#5C5C55', 700: '#44443F',
        },
        danger: { 50: '#FDF2F0', 300: '#E9A69A', 500: '#B4472F', 600: '#8F3624' },
        warn: { 50: '#FDF8EE', 300: '#E5C98A', 500: '#9C7A21' },
        ok: { 50: '#EFF7F2', 300: '#9BCBB2', 500: '#2F7D55' },
        info: { 50: '#EFF4F9', 300: '#9FBDD8', 500: '#33628F' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,38,32,.04), 0 6px 18px -8px rgba(18,38,32,.14)',
        lift: '0 2px 6px rgba(18,38,32,.06), 0 18px 36px -18px rgba(18,38,32,.28)',
      },
      borderRadius: { xl2: '1.15rem' },
    },
  },
  plugins: [],
};
