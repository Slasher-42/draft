import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0faf5',
          100: '#d9f2e6',
          200: '#b3e5cd',
          300: '#7dcfaa',
          400: '#44b282',
          500: '#229163',
          600: '#167550',
          700: '#125e41',
          800: '#0f4b35',
          900: '#0c3d2b',
          950: '#071f16',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        surface: {
          DEFAULT: '#0a1628',
          card:    '#111f35',
          border:  '#1e3352',
          muted:   '#4a6080',
          subtle:  '#0d1c30',
        },
        success: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark:  '#065f46',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark:  '#92400e',
        },
        danger: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark:  '#991b1b',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0a1628 0%, #071f16 100%)',
        'gradient-card':  'linear-gradient(145deg, #111f35 0%, #0a1628 100%)',
        'gradient-gold':  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      },
      animation: {
        'fade-in':   'fadeIn 0.5s ease forwards',
        'slide-up':  'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in':  'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer':   'shimmer 1.8s infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                              to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-24px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'card':  '0 4px 24px rgba(0, 0, 0, 0.4)',
        'glow':  '0 0 40px rgba(34, 145, 99, 0.15)',
        'gold':  '0 0 40px rgba(245, 158, 11, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;