import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Kinakailangan para sa Docker! Pinapayagan ang connection mula sa labas ng container
    port: 5173, // Ang port na gagamitin ng Vite
    watch: {
      usePolling: true, // Opsyonal: Nakakatulong para gumana ang Hot Reloading (HMR) habang nasa Docker (lalo na sa Windows/WSL)
    },
  },
})