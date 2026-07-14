/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glamp: {
          50: '#f2f8f5',
          100: '#e1efe7',
          500: '#348e5e',
          600: '#267049',
          700: '#1e5a3d',
          800: '#1e4b33',
          900: '#193f2b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
