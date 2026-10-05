import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['.elb.ap-south-1.amazonaws.com'], // AWS load balancer ka hostname allow karta hai
    watch: { usePolling: true }, // makes hot reload work inside Docker on Windows/Mac
  },
});
