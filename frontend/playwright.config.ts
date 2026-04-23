import { createLovableConfig } from "lovable-agent-playwright-config/config";

/**
 * SNR ENGINE V2 - Playwright Global Configuration
 * Bu ayarlar hem testler hem de agent operasyonları için temeldir.
 */
export default createLovableConfig({
  // Global zaman aşımı: X gibi ağır siteler için 60 saniye idealdir.
  timeout: 60000,
  
  use: {
    // Dashboard API ana üssü
    baseURL: 'https://1991-pi.vercel.app',
    
    // Tarayıcıyı görünür yapmak istiyorsan false, arka planda kalsın dersen true
    headless: false,

    // İzleme ve Ekran Görüntüsü (Hata analizi için)
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',

    // X'in bot korumasını aşmak için viewport ayarı
    viewport: { width: 1366, height: 768 },
    
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    }
  },

  // Hata durumunda kaç kez tekrar denesin?
  retries: 1,
});