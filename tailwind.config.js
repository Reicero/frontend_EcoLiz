/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#0F7A3E',
          700: '#0d6936',
          800: '#0a5429',
          900: '#08401f',
          950: '#042815',
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#36BFCE',
          500: '#2BB5C9',
          600: '#1e9bb0',
          700: '#1a7c8f',
          800: '#186172',
          900: '#175061',
        },
        dark: '#0A0F0D',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Instrument Serif', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(15, 122, 62, 0.15)',
      }
    },
  },
  plugins: [],
}