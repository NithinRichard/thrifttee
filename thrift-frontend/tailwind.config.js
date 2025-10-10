/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          50: '#faf7f0',
          100: '#f4ede1',
          200: '#e8d9c2',
          300: '#dbc19e',
          400: '#cca678',
          500: '#c1935e',
          600: '#b48252',
          700: '#966a45',
          800: '#7a563d',
          900: '#644733',
        },
        earth: {
          50: '#f6f4f0',
          100: '#ebe6dc',
          200: '#d8ccbb',
          300: '#c0ab94',
          400: '#a8896f',
          500: '#967558',
          600: '#89654c',
          700: '#725340',
          800: '#5e4538',
          900: '#4e3a30',
        }
      },
      fontFamily: {
        'vintage': ['Georgia', 'serif'],
        'modern': ['Inter', 'sans-serif'],
        'industrial': ['Courier New', 'Lucida Console', 'monospace'],
        'typewriter': ['Courier New', 'Lucida Console', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'parallax': 'parallax 1s ease-out',
        'drawer-slide': 'drawerSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'stamp-press': 'stampPress 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        parallax: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-20px)' },
        },
        drawerSlideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        stampPress: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}