/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dashboard'da kullandığımız renkleri buraya basitçe tanımlayalım
        'cyber-neon': '#00f3ff',
        'cyber-green': '#39ff14',
        'cyber-pink': '#ff00ff',
        'cyber-yellow': '#fff200',
      }
    },
  },
  plugins: [],
}