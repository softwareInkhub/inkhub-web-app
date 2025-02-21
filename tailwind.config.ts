import type { Config } from "tailwindcss";
const { nextui } = require("@nextui-org/react");

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-left': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-10px)' }
        },
        'bounce-right': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(10px)' }
        },
        'tutorial-hand': {
          '0%, 45%': { transform: 'translateX(0) rotate(0deg)' },
          '5%, 40%': { transform: 'translateX(-20px) rotate(0deg)' },
          '50%, 95%': { transform: 'translateX(0) rotate(0deg)' },
          '55%, 90%': { transform: 'translateX(20px) rotate(0deg)' },
          '100%': { transform: 'translateX(0) rotate(0deg)' }
        },
        'tutorial-heart': {
          '0%, 45%, 50%, 100%': { opacity: '0', transform: 'translateX(0)' },
          '5%, 40%': { opacity: '1', transform: 'translateX(-20px)' }
        },
        'tutorial-cart': {
          '0%, 50%, 95%, 100%': { opacity: '0', transform: 'translateX(0)' },
          '55%, 90%': { opacity: '1', transform: 'translateX(20px)' }
        },
        'swipe-left': {
          '0%': { transform: 'translateX(100px) scaleY(0)' },
          '50%': { transform: 'translateX(0) scaleY(1)' },
          '100%': { transform: 'translateX(-100px) scaleY(0)' }
        },
        'swipe-right': {
          '0%': { transform: 'translateX(-100px) scaleY(0)' },
          '50%': { transform: 'translateX(0) scaleY(1)' },
          '100%': { transform: 'translateX(100px) scaleY(0)' }
        }
      },
      animation: {
        slideUp: 'slideUp 0.7s ease forwards',
        'bounce-left': 'bounce-left 1s infinite',
        'bounce-right': 'bounce-right 1s infinite',
        'tutorial-hand': 'tutorial-hand 4s ease-in-out infinite',
        'tutorial-heart': 'tutorial-heart 4s ease-in-out infinite',
        'tutorial-cart': 'tutorial-cart 4s ease-in-out infinite',
        'swipe-left': 'swipe-left 2s ease-in-out infinite',
        'swipe-right': 'swipe-right 2s ease-in-out infinite'
      }
    },
  },
  plugins: [nextui()],
};

export default config;
