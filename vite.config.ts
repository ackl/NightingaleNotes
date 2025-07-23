import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'music-theory-engine': ['./src/lib'],
          'audio-engine': ['./src/context/audio'],
          abcjs: ['abcjs'],
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
