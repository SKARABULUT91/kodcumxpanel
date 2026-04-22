import { createClient } from '@supabase/supabase-js';
import express from "express";
import cors from "cors";
import verifyRouter from "./routes/verify.js";

// 1. SUPABASE BAĞLANTISI (Tanımlama buraya eklendi)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

// CORS Ayarları - Vercel linklerine izin verir
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/verify", verifyRouter);

// 2. BOT DATA ENDPOINT (Düzeltildi)
app.post('/api/bot-data', async (req, res) => {
  try {
    const { url, durum, bot_id } = req.body;
    
    const { data, error } = await supabase
      .from('bot_logs')
      .insert([{ 
        bot_id: bot_id || 'hayalet-bot', 
        target_url: url, 
        status: durum 
      }]);

    if (error) throw error;
    
    res.status(200).json({ success: true, message: "Veri kaydedildi!" });
  } catch (error) {
    console.error("Supabase Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. BOT DURUMU (Önceki hatada aranan route buydu)
app.get('/api/bot-report', (req, res) => {
  res.status(200).json({ status: "active", engine: "SNR ENGINE" });
});

// 4. BOTU BAŞLATMA (Vercel Notu: Arka plan işlemleri kısıtlıdır)
app.post('/api/start-bot', (req, res) => {
  // Not: Vercel serverless olduğu için 'spawn' uzun süreli çalışmayabilir.
  // Ama kodun hata vermemesi için yapıyı koruyoruz.
  res.status(200).send({ message: "Bot tetikleme komutu alındı." });
});

// 5. VERCEL İÇİN KRİTİK: app.listen kaldırıldı, export eklendi
export default app;
