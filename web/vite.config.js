import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Three.js + R3F + Framer Motion together exceed 500 kB — expected for this app
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) requires manualChunks as a function
        manualChunks(id) {
          if (id.includes('three') || id.includes('@react-three')) return 'vendor-three';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('gsap')) return 'vendor-gsap';
          if (id.includes('react-router-dom')) return 'vendor-router';
        },
      },
    },
  },
})
