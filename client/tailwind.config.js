/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#d4af37', light: '#f0d060', dark: '#a07820' },
        'card-bg': '#1a1a2e',
        'card-border': '#d4af37',
      },
      fontFamily: {
        card: ['Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 0 20px rgba(212,175,55,0.4), inset 0 0 20px rgba(0,0,0,0.5)',
        'card-hover': '0 0 40px rgba(212,175,55,0.8), 0 20px 60px rgba(0,0,0,0.8)',
        ko: '0 0 30px rgba(255,0,0,0.8)',
      },
      keyframes: {
        shake: { '0%,100%': { transform: 'translateX(0)' }, '20%': { transform: 'translateX(-8px)' }, '40%': { transform: 'translateX(8px)' }, '60%': { transform: 'translateX(-6px)' }, '80%': { transform: 'translateX(6px)' } },
        dealCard: { '0%': { transform: 'translateY(-100px) rotate(-5deg)', opacity: '0' }, '100%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' } },
        glare: { '0%': { transform: 'translateX(-150%) rotate(30deg)' }, '100%': { transform: 'translateX(150%) rotate(30deg)' } },
        pulse_gold: { '0%,100%': { boxShadow: '0 0 10px rgba(212,175,55,0.5)' }, '50%': { boxShadow: '0 0 30px rgba(212,175,55,1)' } },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        dealCard: 'dealCard 0.4s ease-out',
        glare: 'glare 2s ease-in-out infinite',
        pulse_gold: 'pulse_gold 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
