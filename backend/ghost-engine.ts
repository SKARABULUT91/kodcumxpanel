/**
 * SNR ENGINE V2 - Dynamic Redirection & Ghost Execution
 * Sistem, tetiklenen güncel linki takip eder.
 */
import { chromium } from 'playwright';
import path from 'path';
import axios from 'axios';

(async () => {
  const userDataDir = path.join(process.cwd(), 'user_data_folder');
  const API_BASE = 'http://localhost:3000/api'; // Dashboard API adresi

  console.log("🕵️ OPERASYON: Dinamik Yönlendirme Motoru Devrede...");

  // 1. ADIM: Güncel Yönlendirilmiş Linki Al
  let currentTarget: string | null = null;
  
  try {
    console.log("📡 API_FETCH: Güncel operasyon linki sorgulanıyor...");
    const res = await axios.get(`${API_BASE}/get-current-target`);
    currentTarget = res.data.targetUrl; // API'den gelen güncel link
  } catch (err) {
    console.log("⚠️ UYARI: API bağlantısı kurulamadı veya hedef tanımlanmadı.");
  }

  if (!currentTarget) {
    console.log("🏁 BİLGİ: Aktif yönlendirme bulunamadı. Operasyon askıya alındı.");
    return;
  }

  // 2. ADIM: Motoru Ateşle
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: process.platform === 'win32' ? undefined : '/usr/bin/chromium',
    headless: false,
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080'
    ]
  });

  const page = await context.newPage();

  // Network Monitor: Veri yakalamaya devam
  page.on('response', async (res) => {
    if (res.url().includes('TweetDetail') && res.status() === 200) {
      await axios.post(`${API_BASE}/bot-data`, { 
        status: "infiltrated", 
        url: currentTarget 
      }).catch(() => {});
    }
  });

  try {
    console.log(`\n🔗 GÜNCEL_HEDEF_İNJECTED: ${currentTarget}`);
    
    // Yönlendirmeyi (Redirect) takip ederek sayfaya git
    await page.goto(currentTarget, { 
      waitUntil: 'networkidle', // Sayfanın tam oturduğundan emin ol
      timeout: 60000 
    });

    // Hayalet Etkileşim Protokolü
    console.log("🕶️ GHOST_ACTION: İnsan davranış simülasyonu uygulanıyor...");
    await page.waitForTimeout(Math.random() * 3000 + 2000);
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, -150);

    console.log(`✅ MISSION_COMPLETE: ${currentTarget} başarıyla işlendi.`);

  } catch (err) {
    console.log(`❌ HATA: Operasyon yarıda kesildi -> ${err.message}`);
  }

  // Operasyon bitince iz bırakmadan kapat
  await page.waitForTimeout(3000);
  await context.close();
  console.log("🏁 SİSTEM: Bekleme moduna dönüldü.");
})();