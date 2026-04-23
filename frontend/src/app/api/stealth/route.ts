import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Stealth modunu bir kez aktif et
if (puppeteer.customQueryHandlers === undefined) {
  puppeteer.use(StealthPlugin());
}

export async function POST(request: Request) {
  // Frontend'den gelen targetUrl ve proxyData'yı alıyoruz
  const { targetUrl, proxyData } = await request.json();

  const launchOptions: any = {
    headless: "new", // Modern headless modu
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=WebRtcHideLocalIpsWithMdns'
    ]
  };

  // 1. ADIM: Proxy Enjeksiyonu (server.js'den gelen mantık)
  if (proxyData?.host) {
    console.log(`[PROXY] SOCKS5 Aktif: ${proxyData.host}`);
    launchOptions.args.push(`--proxy-server=socks5://${proxyData.host}:${proxyData.port}`);
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();

    // 2. ADIM: Proxy Kimlik Doğrulama
    if (proxyData?.user && proxyData?.pass) {
      await page.authenticate({
        username: proxyData.user,
        password: proxyData.pass
      });
    }

    // 3. ADIM: İnsan Gibi Davranış Ayarları
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ];
    await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`[NAVIGATE] Hedefe gidiliyor: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // 4. ADIM: Reklam Tarama ve Senin Meşhur 2 Saniye Kuralın
    const tweets = await page.$$('article[data-testid="tweet"]');
    
    for (let i = 0; i < Math.min(tweets.length, 10); i++) {
        const tweet = tweets[i];
        const isAd = await tweet.evaluate(el => 
            el.innerText.includes('Promoted') || 
            el.innerText.includes('Sponsorlu') || 
            el.innerText.includes('Reklam')
        );

        if (isAd) {
            console.log(`[AD FOUND] Reklam üzerinde duruluyor...`);
            await tweet.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));

            // --- 1900ms - 2600ms ARASI RASTGELE BEKLEME ---
            const waitTime = Math.floor(Math.random() * (2600 - 1900 + 1) + 1900);
            await new Promise(r => setTimeout(r, waitTime));
            
            // Minik mouse hareketi simülasyonu
            await page.mouse.move(Math.random() * 100, Math.random() * 100);
        }
    }

    await browser.close();
    return NextResponse.json({ success: true, message: "Operasyon Başarıyla Tamamlandı" });

  } catch (error: any) {
    console.error(`[FATAL ERROR] ${error.message}`);
    if (browser) await browser.close();
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}