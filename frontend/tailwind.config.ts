import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#07111f',
        panel: '#0c1729',
        stroke: 'rgba(255,255,255,0.08)',
        brand: {
          500: '#7c3aed',
          600: '#6d28d9',
        },
        accent: '#22d3ee',
        success: '#34d399',
        warning: '#f59e0b',
      },
      boxShadow: {
        glow: '0 20px 80px rgba(124, 58, 237, 0.18)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at top, rgba(124,58,237,0.2), transparent 40%), radial-gradient(circle at 20% 20%, rgba(34,211,238,0.12), transparent 25%)',
      },
    },
  },
  plugins: [],
};

export default config;
