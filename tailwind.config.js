/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Retro gaming color palette
        'retro-pink': '#FF006E',
        'retro-blue': '#0080FF',
        'retro-purple': '#8000FF',
        'retro-green': '#00FF80',
        'retro-yellow': '#FFD600',
        'retro-cyan': '#00FFFF',
        'retro-orange': '#FF6B00',
        
        // Dark backgrounds
        'retro-dark': '#0A0A0F',
        'retro-dark-purple': '#1A0033',
        'retro-navy': '#000033',
        
        // Accent colors
        'neon-pink': '#FF10F0',
        'neon-blue': '#00D9FF',
        'neon-green': '#39FF14',
      },
      fontFamily: {
        // Pixel/bitmap fonts - these need to be loaded via expo-font
        'pixel': ['PressStart2P', 'monospace'],
        'retro': ['VT323', 'monospace'],
      },
      boxShadow: {
        // Solid, pixel-perfect shadows for retro 3D effect
        'retro': '4px 4px 0px #000000',
        'retro-sm': '2px 2px 0px #000000',
        'retro-lg': '6px 6px 0px #000000',
        'retro-xl': '8px 8px 0px #000000',
        'neon-pink': '0 0 10px #FF10F0, 0 0 20px #FF10F0',
        'neon-blue': '0 0 10px #00D9FF, 0 0 20px #00D9FF',
      },
      borderWidth: {
        '3': '3px',
        '5': '5px',
        '6': '6px',
      },
      spacing: {
        // 8px grid system
        '18': '4.5rem',  // 72px
        '22': '5.5rem',  // 88px
      },
      borderRadius: {
        // Prefer sharp corners, but include pixel-friendly options
        'pixel': '2px',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
};

