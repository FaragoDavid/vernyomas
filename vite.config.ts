import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
  plugins: [tailwindcss(), react()],
  base: mode === 'production' ? '/vernyomas/' : '/',
  root: 'src',
  envDir: '..',
  publicDir: '../public',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
  },
  server: {
    port: 5174,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
  },
}));
