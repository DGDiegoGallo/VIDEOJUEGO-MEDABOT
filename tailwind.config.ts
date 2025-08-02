import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'modal-in': 'modalIn 0.3s ease-out',
        'modal-out': 'modalOut 0.3s ease-in',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shine': 'shine 3s ease-in-out infinite',
        'health-pulse': 'healthPulse 2s ease-in-out infinite',
        'exp-glow': 'expGlow 2s ease-in-out infinite',
      },
      keyframes: {
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        modalOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(400%)', opacity: '0' },
        },
        healthPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.4)' },
        },
        expGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.8), 0 0 25px rgba(168, 85, 247, 0.4)' },
        }
      },
      colors: {
        game: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          dark: '#1f2937',
          darker: '#111827'
        }
      },
      aspectRatio: {
        '16/9': '16 / 9',
      },
      screens: {
        'xs': '475px',
      }
    },
  },
  plugins: [],
} satisfies Config