const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-accent': {
          50: '#eef2ff',
          100: '#e0e7ff',
          600: '#4f46e5',
        }
      },
      fontFamily: {
        // A sophisticated serif for headings
        'serif-display': ['"Playfair Display"', 'serif'],
        // A clean, geometric sans-serif for body text
        'sans-body': ['"Inter"', 'sans-serif'],
      },
       colors: {
        'brand-blue': {
          '50': '#eff6ff',
          '100': '#dbeafe',
          '200': '#bfdbfe',
          '300': '#93c5fd',
          '400': '#60a5fa',
          '500': '#3b82f6',
          '600': '#2563eb',
          '700': '#1d4ed8',
          '800': '#1e40af',
          '900': '#1e3a8a',
          '950': '#172554',
        },
      }
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.scrollbar-webkit': {
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#cbd5e1',
            borderRadius: '6px',
            border: '2px solid #f1f5f9'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#a0aec0'
          }
        }
      })
    })
  ],
}

