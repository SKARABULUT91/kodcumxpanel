import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Tarayıcı ortamını simüle eder (React bileşenleri için şart)
    environment: "jsdom",
    // describe, it, expect gibi komutları her dosyaya import etmeden kullanmanı sağlar
    globals: true,
    // Testlerin başlamadan önce yükleyeceği ayar dosyası
    setupFiles: ["./src/test/setup.ts"],
    // Test dosyalarının nerede aranacağını belirler
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Gereksiz bağımlılıkları test dışı bırakır
    exclude: ["node_modules", ".next", "dist"],
  },
  resolve: {
    alias: {
      // Proje içindeki '@' kısayolunu testlerin de anlaması için şart
      "@": path.resolve(__dirname, "./src"),
    },
  },
});