import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Permite acceso desde otros dispositivos en la misma red WiFi
    // Tu celular podrá acceder usando la IP de tu PC (ej: http://192.168.1.15:5173)
    host: true,
  },
});
