/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF7A3D',
        beige: '#FFF3E6',
        navy: '#0B2C4A',
        green: '#6DBE45',
        red: '#D32F2F',
        background: '#FFF3E6',
        dark: '#0B2C4A',
        accent: '#D32F2F',
      },
      fontFamily: {
        sans: ['\'Nunito Sans\'', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
