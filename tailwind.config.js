/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffdf0',
          100: '#fffab8',
          200: '#fff470',
          300: '#ffe829',
          400: '#ffd000',
          500: '#d9a700',
          600: '#b37e00',
          700: '#8c5900',
          800: '#663c00',
          900: '#422400',
        },
        mining: {
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
        }
      }
    },
  },
  plugins: [],
}
