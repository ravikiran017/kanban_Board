import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // base: '/kanban_board/',  // Set to the name of your repository
  build: {
    outDir: 'dist',  // Ensure the output is in the 'dist' folder
  },
});
