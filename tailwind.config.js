/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#00E620',
          'green-dark': '#00CC00',
          'green-muted': 'rgba(0, 230, 32, 0.15)',
        },
        surface: {
          DEFAULT: '#111111',
          raised: '#161616',
          overlay: '#1A1A1A',
        },
        bg: {
          DEFAULT: '#0A0A0A',
          sidebar: '#0D0D0D',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 230, 32, 0.3)',
        'glow-green-sm': '0 0 10px rgba(0, 230, 32, 0.2)',
      },
      borderRadius: {
        card: '16px',
        modal: '24px',
      },
    },
  },
  plugins: [],
}
