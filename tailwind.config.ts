import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'media', // Enable dark mode based on system preference
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        primary: '#FF4C91', // Royale Pink
        secondary: '#9B4B9A', // Deep Grape
        accent: '#FFD447', // Accent Yellow
        background: '#FFFFFF',
        text: '#1A1A1A',
        tag: '#4B9A9B',
        cta: '#FFD447',
        
        // Dark mode colors
        dark: {
          primary: '#FF4C91', // Keep pink for brand consistency
          secondary: '#B56BB5', // Lighter grape for dark mode
          accent: '#FFD447', // Keep yellow for contrast
          background: '#1A1A1A',
          text: '#F5F5F5',
          tag: '#4B9A9B',
          cta: '#FFD447',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-playfair)'],
        serif: ['var(--font-merriweather)'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config; 