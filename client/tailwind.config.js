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
        // Malbec — vino argentino, zero colisión competitiva en el mercado AR
        primary: {
          50:  '#fdf2f8',
          100: '#fce4f1',
          200: '#f9bed9',
          300: '#f491be',
          400: '#eb5a9d',
          500: '#d4277a',
          600: '#ab1f64',
          700: '#801550',
          800: '#5b1039',
          900: '#3e0b27',
          950: '#230614',
        },
        // Ámbar dorado — cálido, energético, complementa el Malbec
        accent: {
          50:  '#fffbeb',
          100: '#fef0c2',
          200: '#fdd884',
          300: '#fbbf45',
          400: '#f9a518',
          500: '#e8890a',
          600: '#c96d07',
          700: '#a3540a',
          800: '#82400f',
          900: '#6b360f',
          950: '#3d1c04',
        },
        surface: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          850: '#1a1a1a',
          900: '#171717',
          950: '#0a0a0a',
        },
        success: { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
        warning: { 50: '#fffbeb', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
        error:   { 50: '#fef2f2', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display':   ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
        'heading-1': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'heading-2': ['1.5rem',  { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg':   ['1.125rem', { lineHeight: '1.6' }],
        'body':      ['1rem', { lineHeight: '1.6' }],
        'body-sm':   ['0.875rem', { lineHeight: '1.5' }],
        'caption':   ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
      },
      boxShadow: {
        'xs':         '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'card':       '0 1px 3px rgb(0 0 0 / 0.04), 0 1px 2px rgb(0 0 0 / 0.06)',
        'card-hover': '0 8px 24px -4px rgb(0 0 0 / 0.1), 0 2px 8px -2px rgb(0 0 0 / 0.04)',
        'float':      '0 12px 40px -8px rgb(0 0 0 / 0.18)',
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
        'content': '72rem',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
