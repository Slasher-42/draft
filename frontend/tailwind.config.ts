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
        display: ['var(--font-display)', 'Sora', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          DEFAULT: '#0a0f1e',
          card:    '#0f172a',
          border:  '#1e293b',
          muted:   '#475569',
          subtle:  '#0d1424',
        },
        gold: {
          50:  '#fffbeb',
          400: '#fbbf24',
          500: '#f59e0b',
        },
        success: { light: '#d1fae5', DEFAULT: '#10b981', dark: '#065f46' },
        warning: { light: '#fef3c7', DEFAULT: '#f59e0b', dark: '#92400e' },
        danger:  { light: '#fee2e2', DEFAULT: '#ef4444', dark: '#991b1b' },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0a0f1e 0%, #172554 100%)',
        'gradient-card':  'linear-gradient(145deg, #0f172a 0%, #0a0f1e 100%)',
        'gradient-blue':  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in': 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer':  'shimmer 1.8s infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                               to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-24px)' },to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'glow': '0 0 40px rgba(59,130,246,0.15)',
        'blue': '0 0 30px rgba(59,130,246,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;