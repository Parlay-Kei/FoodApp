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
        primary: '#D72687', // Royale Pink
        secondary: '#FF4C91', // Gradient start
        accent: '#FFD447', // CTA Yellow
        background: '#FFF5E5', // Background
        text: '#2C003E', // Text color
        tag: '#51C495', // Tag accent
        // Keep some existing colors for backward compatibility
        navy: '#0B2C4A',
        green: '#6DBE45',
        red: '#D32F2F',
        dark: '#2C003E',
      },
      fontFamily: {
        sans: ['Inter', 'Mulish', 'Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Rasa', 'serif'],
        display: ['Amandine', 'Playfair Display', 'serif'], // For headings
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #FF4C91, #D72687)',
      },
    },
  },
  plugins: [],
}
