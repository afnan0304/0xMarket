import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Fira Code"', 'Menlo', 'Monaco', 'monospace'],
        retro: ['VT323', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.5', letterSpacing: '0.5px' }],
        sm: ['13px', { lineHeight: '1.5', letterSpacing: '0.3px' }],
        base: ['14px', { lineHeight: '1.6', letterSpacing: '0px' }],
        lg: ['15px', { lineHeight: '1.6', letterSpacing: '0px' }],
        xl: ['16px', { lineHeight: '1.7', letterSpacing: '-0.3px' }],
        '2xl': ['18px', { lineHeight: '1.7', letterSpacing: '-0.4px' }],
        '3xl': ['20px', { lineHeight: '1.8', letterSpacing: '-0.5px' }],
        '4xl': ['24px', { lineHeight: '1.8', letterSpacing: '-0.6px' }],
      },
      spacing: {
        px: '1px',
        0: '0',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        4.5: '18px',
        5: '20px',
        5.5: '22px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
      },
      gap: {
        0: '0',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '0.88' },
          '50%': { opacity: '0.97' },
        },
      },
      animation: {
        flicker: 'flicker 6s ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
