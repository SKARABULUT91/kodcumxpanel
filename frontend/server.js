import { createClient } from '@supabase/supabase-js';
import express from "express";
import cors from "cors";
import verifyRouter from "./routes/verify.js";
import dotenv from "dotenv";

// .env dosyasındaki değişkenleri yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Localhost portu

// 1. SUPABASE BAĞLANTISI
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ KRİTİK HATA: .env dosyasında Supabase bilgileri eksik!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. MIDDLEWARE
app.use(cors()); // Dashboard'un bu porta erişebilmesi için şart
app.use(express.json());

// 3. ROUTES
app.use("/api/verify", verifyRouter);

// BOT DATA - Ghost Engine'den gelen logları kaydeder
app.post('/api/bot-data', async (req, res) => {
  try {
    const { url, durum, bot_id } = req.body;
    
    console.log(`📩 Veri Geldi: [${bot_id}] -> ${url} (${durum})`);

    const { data, error } = await supabase
      .from('bot_logs')
      .insert([{ 
        bot_id: bot_id || 'hayalet-bot', 
        target_url: url, 
        status: durum,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    
    res.status(200).json({ success: true, message: "SNR ENGINE: Log veritabanına işlendi." });
  } catch (error) {
    console.error("❌ Veritabanı Hatası:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// BOT REPORT - Dashboard için son aktiviteleri getirir
app.get('/api/bot-report', async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('bot_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20); // Local'deyiz, biraz daha fazla veri çekebiliriz

    if (error) throw error;

    res.status(200).json({ 
      engine: "SNR ENGINE V2", 
      status: "online", 
      port: PORT,
      last_activities: logs || [] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BOT START - Operasyonu tetikleme
app.post('/api/start-bot', (req, res) => {
  console.log("⚡ SNR ENGINE: Manuel tetikleme sinyali alındı. Operasyon başlıyor...");
  res.status(200).send({ message: "Ghost Mode tetiklendi. Local engine devrede." });
});

// 4. SERVER LISTEN (Localhost Başlatıcı)
app.listen(PORT, () => {
  console.log(`
  🚀 SNR ENGINE V2 - MERKEZ KOMUTA AKTİF
  --------------------------------------
  📍 Adres: http://localhost:${PORT}
  📡 Durum: Dinlemede...
  --------------------------------------
  `);
});