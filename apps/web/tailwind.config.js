/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#34d399',
        purchase: '#8b5cf6',
        secondary: '#6ee7b7',
        dark: '#0a0a0f',
        surface: '#12121a',
        'surface-light': '#1e1e2e',
        line: '#1e1e2e',
        text: '#e2e8f0',
        'text-muted': '#94a3b8',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
      },
    },
  },
  plugins: [],
}
