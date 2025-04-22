/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        profit: '#22c55e',
        loss: '#ef4444',
        card: '#1e293b',
        surface: '#0f172a',
      }
    }
  },
  plugins: [],
}
