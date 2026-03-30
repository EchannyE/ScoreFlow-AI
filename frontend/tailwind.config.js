/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          0: '#080C14',
          1: '#0D1220',
          2: '#111827',
          3: '#1A2236',
        },
        border: {
          DEFAULT: '#1E2535',
          hover:   '#2D3A50',
        },
        text: {
          1: '#F0F2F8',
          2: '#8892A4',
          3: '#4A5568',
        },
        green:  '#00D4AA',
        purple: '#7B5EA7',
        red:    '#E05260',
        orange: '#F5A623',
        blue:   '#4FC3F7',
      },
      fontFamily: {
        mono:    ["'DM Mono'", "'Courier New'", 'monospace'],
        display: ["'Clash Display'", 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp .3s ease forwards',
        'spin-fast': 'spin .8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
 