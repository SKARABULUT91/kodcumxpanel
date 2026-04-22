import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Server bloğunu tamamen sildik. 
  // Vite artık varsayılan ayarlarıyla çalışacak, Vercel ise portu kendi yönetecek.
});
