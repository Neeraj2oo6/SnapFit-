/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFFAF5',
          100: '#D3F5E7',
          200: '#A9ECCF',
          500: '#087F5B',
          600: '#056B4A',
          700: '#045339',
          800: '#033C29',
          900: '#14213D',
        },
        primary: {
          DEFAULT: '#087F5B',
          dark: '#056B4A',
          light: '#EFFAF5',
        },
        navy: {
          900: '#14213D',
          800: '#1F2E4D',
          700: '#2A3C60',
        },
        mint: {
          light: '#EFFAF5',
          card: '#E2F7EE',
          border: '#C2EFE1',
        },
        pastel: {
          blue: '#E7F5FF',
          purple: '#F3F0FF',
          orange: '#FFF4E6',
          pink: '#FFF0F6',
          green: '#EFFAF5',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Manrope', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(16, 32, 51, 0.05)',
        'soft-hover': '0 20px 40px -10px rgba(7, 139, 104, 0.12)',
        'phone': '0 25px 50px -12px rgba(16, 32, 51, 0.25)',
        'float': '0 20px 35px -8px rgba(7, 139, 104, 0.15)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 2s infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        scan: {
          '0%': { top: '5%' },
          '50%': { top: '90%' },
          '100%': { top: '5%' },
        }
      }
    },
  },
  plugins: [],
}
