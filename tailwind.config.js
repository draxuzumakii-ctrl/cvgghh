/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        electric: {
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#00f0ff',
          600: '#0284c7',
          700: '#0369a1',
        },
        dark: {
          950: '#05070d',
          900: '#090d18',
          850: '#0d1322',
          800: '#12192d',
          750: '#172038',
          700: '#1e2846',
          600: '#2c395f'
        }
      },
      boxShadow: {
        'electric-glow': '0 0 20px -3px rgba(0, 240, 255, 0.25)',
        'electric-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 10px -2px rgba(0, 240, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
