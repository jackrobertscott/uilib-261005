import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@ui$/, replacement: fileURLToPath(new URL('./src/lib/index.ts', import.meta.url)) },
      { find: /^@ui\//, replacement: fileURLToPath(new URL('./src/lib/', import.meta.url)) },
    ],
  },
});
