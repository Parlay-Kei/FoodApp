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
        primary: '#FF6B35',
        secondary: '#2EC4B6',
        background: '#FDFFFC',
        dark: '#011627',
        accent: '#E71D36',
      },
    },
  },
  plugins: [],
}
