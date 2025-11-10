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
        // Peppercoin brand colors
        'pepper-red': '#E54545',
        'forest': '#1E4F3A',
        'forest-green': '#1E4F3A',
        'leaf': '#2E6B4E',
        'leaf-green': '#2E6B4E',
        'mint': '#8FD9A8',
        'gold': '#FFC043',
        'off-white': '#FAFAF7',
        'ink': '#11181C',
        
        // Surface colors
        'surface': '#FFFFFF',
        'surface-alt': '#F3F6F4',
        'border': '#1A2A22',
        
        // Semantic colors
        'primary': '#E54545',
        'secondary': '#1E4F3A',
        'accent': '#FFC043',
      },
      fontFamily: {
        // Peppercoin custom fonts
        'pixel': ['PPNeueBit-Bold', 'system-ui'],
        'sans': ['PPMondwest-Regular', 'system-ui'],
      },
      boxShadow: {
        // Solid, pixel-perfect shadows for retro 3D effect
        'retro': '4px 4px 0px #000000',
        'retro-sm': '2px 2px 0px #000000',
        'retro-lg': '6px 6px 0px #000000',
        'retro-xl': '8px 8px 0px #000000',
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

