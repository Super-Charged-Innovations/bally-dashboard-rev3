/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bally's Casino Brand Colors
        'bally': {
          50: '#fef2f2',
          100: '#fee2e2', 
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Base red
          600: '#dc2626', // Primary Bally's red
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#451a03',
        },
        'casino': {
          'gold': '#FFD700',
          'deep-red': '#8B0000',
          'luxury-black': '#1A1A1A',
          'luxury-gray': '#2D2D2D',
          'luxury-light': '#4A4A4A',
          'champagne': '#F7E7CE',
        },
        // Member Tier Colors
        'tier': {
          'ruby': '#E53935',
          'sapphire': '#1976D2',
          'diamond': '#9E9E9E', 
          'vip': '#FFD700',
        },
        // Casino Status Colors
        'status': {
          'active': '#2E7D32',
          'inactive': '#757575',
          'warning': '#F57C00',
          'critical': '#C62828',
        },
        // Primary color override
        'primary': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca', 
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#dc2626', // Primary casino red
        }
      },
      fontFamily: {
        'casino-serif': ['Playfair Display', 'Crimson Text', 'serif'],
        'casino-sans': ['Inter', 'Roboto', 'sans-serif'],
        'casino-mono': ['Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        'display': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'casino': '0 8px 32px rgba(220, 38, 38, 0.15)',
        'luxury': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'gold': '0 4px 16px rgba(255, 215, 0, 0.3)',
        'inner-luxury': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'casino-gradient': 'linear-gradient(135deg, #dc2626 0%, #8B0000 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
        'luxury-gradient': 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)',
        'tier-ruby': 'linear-gradient(135deg, #E53935 0%, #B71C1C 100%)',
        'tier-sapphire': 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
        'tier-diamond': 'linear-gradient(135deg, #9E9E9E 0%, #424242 100%)',
        'tier-vip': 'linear-gradient(135deg, #FFD700 0%, #FF8F00 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}