/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        // Fade in animation with opacity and scale
        fadeIn: 'fadeIn 0.6s ease-out forwards',
        // Pulse animation for current status indicator
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Smooth scale animation
        scaleUp: 'scaleUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px) scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        scaleUp: {
          '0%': {
            transform: 'scale(0.8)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
      },
    },
  },
};