import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#1b4332',
          800: '#2d6a4f',
          700: '#3d7d5f',
        },
        golden: '#d4a574',
        rust: '#c1440e',
        cream: {
          50: '#f5f1e8',
          100: '#d4c5b9',
        },
      },
      container: {
        center: true,
        padding: '1.5rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
      },
    },
  },
} satisfies Config;
