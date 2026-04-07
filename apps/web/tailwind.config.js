/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C3CE1',
        secondary: '#00D4AA',
        dark: '#0A0A0F',
        surface: '#12121A',
        'surface-light': '#1A1A2E',
        text: '#E8E8F0',
        'text-muted': '#8888AA',
      },
      fontFamily: {
        display: ['Satoshi', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
      },
    },
  },
  plugins: [],
}
