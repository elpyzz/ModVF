/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        surface: {
          0: '#06060a',
          1: '#0c0c14',
          2: '#13131f',
          3: '#1a1a2e',
          4: '#24243a',
          DEFAULT: '#13131f',
        },
        muted: '#64748b',
        primary: '#34d399',
        purchase: '#8b5cf6',
        secondary: '#6ee7b7',
        dark: '#06060a',
        text: '#e2e8f0',
        'text-muted': '#64748b',
      },
      borderRadius: {
        DEFAULT: '12px',
      },
    },
  },
  plugins: [],
}