/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
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
          // Light mode versions
          'light-bg': '#FAFAFA',
          'light-surface': '#FFFFFF',
          'light-accent': '#F5F5F5',
          'light-text': '#1A1A1A',
          'light-muted': '#6B7280',
        },
        // Member Tier Colors - Enhanced for both modes
        'tier': {
          'ruby': '#DC2626',
          'ruby-light': '#FEE2E2',
          'sapphire': '#1976D2',
          'sapphire-light': '#DBEAFE',
          'diamond': '#6B7280', 
          'diamond-light': '#F3F4F6',
          'vip': '#FFD700',
          'vip-light': '#FEF3C7',
        },
        // Casino Status Colors - Accessible contrast
        'status': {
          'active': '#059669',
          'active-light': '#D1FAE5',
          'inactive': '#6B7280',
          'inactive-light': '#F3F4F6',
          'warning': '#D97706',
          'warning-light': '#FED7AA',
          'critical': '#DC2626',
          'critical-light': '#FEE2E2',
        },
        // Adaptive colors for light/dark mode
        'adaptive': {
          'bg': 'rgb(var(--color-bg) / <alpha-value>)',
          'surface': 'rgb(var(--color-surface) / <alpha-value>)',
          'border': 'rgb(var(--color-border) / <alpha-value>)',
          'text': 'rgb(var(--color-text) / <alpha-value>)',
          'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
          'text-accent': 'rgb(var(--color-text-accent) / <alpha-value>)',
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
        'casino-light': '0 4px 16px rgba(220, 38, 38, 0.08)',
        'luxury': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'luxury-light': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'gold': '0 4px 16px rgba(255, 215, 0, 0.3)',
        'gold-light': '0 2px 8px rgba(255, 215, 0, 0.15)',
        'inner-luxury': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'inner-light': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'casino-gradient': 'linear-gradient(135deg, #dc2626 0%, #8B0000 100%)',
        'casino-gradient-light': 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
        'gold-gradient-light': 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        'luxury-gradient': 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)',
        'luxury-gradient-light': 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
        'tier-ruby': 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
        'tier-ruby-light': 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
        'tier-sapphire': 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
        'tier-sapphire-light': 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
        'tier-diamond': 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
        'tier-diamond-light': 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
        'tier-vip': 'linear-gradient(135deg, #FFD700 0%, #F59E0B 100%)',
        'tier-vip-light': 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
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