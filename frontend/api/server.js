import express from "express";
import cors from "cors";
import { createClient } from '@supabase/supabase-js';
import { startBot } from './bot-engine.js'; 

const app = express();

// CORS Ayarları: Frontend (Vercel/Lovable) erişimi için şart
app.use(cors());
app.use(express.json());

// Supabase Bağlantısı (Hata almamak için kontrol ekledik)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// --- MOTOR DEĞİŞKENLERİ ---
let currentBotStatus = "idle";
let activeProxy = null; 
let lastStartTime = null;

// 1. DURUM RAPORU (Frontend sürekli burayı sorgular)
// Frontend'deki checkBackendStatus() ve getFullReport() buraya bağlanır
app.get('/api/bot-report', (req, res) => {
  res.status(200).json({ 
    status: currentBotStatus === "running" ? "working" : "active", 
    engine: "SNR ENGINE V2",
    proxy_connected: !!activeProxy,
    current_proxy_ip: activeProxy ? activeProxy.host : "Direct",
    last_run: lastStartTime,
    timestamp: new Date().toISOString()
  });
});

// 2. OPERASYON BAŞLATMA (Senin "Başlat" butonun burayı tetikler)
// Frontend'deki startBotOperation() buraya POST atar
app.post('/api/start-bot', async (req, res) => {
  const { url } = req.body;

  if (currentBotStatus === "running") {
    return res.status(400).json({ message: "Operasyon zaten sürüyor!" });
  }

  // Motoru ateşle
  lastStartTime = new Date().toISOString();
  currentBotStatus = "running";

  // Bekletmeden yanıt dön (Timeout yememek için)
  res.status(200).json({ 
    success: true,
    message: "Hayalet Ateşlendi!", 
    status: "active"
  });

  // Arka planda botu çalıştır
  try {
    console.log(`[EXEC] Operasyon Başladı: ${url || 'Varsayılan Hedef'}`);
    await startBot(url, activeProxy); 
    console.log("[SUCCESS] Bot görevini tamamladı.");
  } catch (error) {
    console.error("[FATAL] Motor durdu:", error.message);
  } finally {
    currentBotStatus = "idle";
  }
});

// 3. OPERASYON DURDURMA
app.post('/api/stop-bot', (req, res) => {
  currentBotStatus = "idle";
  console.log("[STOP] Operasyon kullanıcı tarafından kesildi.");
  res.status(200).json({ success: true, message: "Operasyon durduruldu" });
});

// 4. PROXY KAYDETME
app.post('/api/save-proxy', (req, res) => {
  const { host, port, user, pass } = req.body;
  activeProxy = { host, port, user, pass };
  res.status(200).json({ message: "Proxy güncellendi" });
});

// Render için port ayarı
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 SNR ENGINE Backend Motoru Port ${PORT} üzerinde gazlıyor...`);
});

export default app;
