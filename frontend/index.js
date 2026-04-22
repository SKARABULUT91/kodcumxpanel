import { chromium } from 'playwright';
import path from 'path';
import axios from 'axios';

(async () => {
  // --- HEDEFLERİN ---
  const tweetUrls = [
    'https://x.com/SKarabulut55449',
    'https://x.com/SKarabulut55449/status/1772656912345678901'
  ];

  const userDataDir = path.join(process.cwd(), 'user_data_folder');
  // API Terminalinde gördüğün adresle eşleşmeli
  const DASHBOARD_URL = 'https://1991-pi.vercel.app/api/bot-data';

  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: '/usr/bin/chromium',
    headless: false,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await context.newPage();

  // Network dinleme ve Dashboard'a veri basma
  page.on('response', async (res) => {
    const url = res.url();
    if ((url.includes('TweetDetail') || url.includes('UserByScreenName')) && res.status() === 200) {
      try {
        console.log("📊 Kritik veri yakalandı, API'ye gönderiliyor...");
        // API'nin beklediği muhtemel JSON formatı
        await axios.post(DASHBOARD_URL, { 
    id: "SNR-" + Date.now(),
    username: "SKarabulut55449", // Burası dashboard'da görünecek isim
    status: "running"
});
        console.log("✅ API onayı alındı.");
      } catch (e) {
        // API kapalıysa veya hata verdiyse burada sessizce devam eder
      }
    }
  });

  console.log("🚀 Otomatik izlenme ve veri toplama başladı...");

  for (const url of tweetUrls) {
    try {
      console.log(`\n🔗 Hedef: ${url}`);
      
      // 'networkidle' yerine 'domcontentloaded' kullanarak zaman aşımı hatasını (Timeout) engelliyoruz
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // Sayfanın yüklenmesi için biraz esneklik tanıyalım
      await page.waitForTimeout(5000);

      // X'in izlenmeyi sayması için gereken etkileşim taklidi
      const bekleme = Math.floor(Math.random() * 5000) + 7000;
      console.log(`⏳ ${bekleme/1000} saniye izlenim bırakılıyor...`);
      
      await page.mouse.wheel(0, 500); // Sayfayı aşağı kaydır
      await page.waitForTimeout(bekleme);
      await page.mouse.wheel(0, -200); // Hafif yukarı kaydır (İnsan hareketi)
      
      console.log(`✅ İşlem tamam: ${url}`);

    } catch (err) {
      // Hatanın nedenini terminalde açıkça görmek için:
      console.log(`❌ Hata oluştu: ${err.message}`);
    }
  }

  console.log("\n🏁 Tüm hedefler gezildi. Dashboard'u (Port 3000) kontrol et.");
  await page.waitForTimeout(5000);
  await context.close();
})();
