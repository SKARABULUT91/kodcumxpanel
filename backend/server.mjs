import { createClient } from '@supabase/supabase-js';
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // .env dosyasını okur

const app = express();
app.use(cors());
app.use(express.json());

// Güvenlik Kontrolü
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error("❌ HATA: .env dosyası bulunamadı veya içindeki bilgiler eksik!");
    process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.post('/api/bot-data', async (req, res) => {
    const { bot_id, url, durum, status } = req.body;
    const { error } = await supabase.from('bot_logs').insert([{ 
        bot_id, target_url: url, durum, status, created_at: new Date().toISOString() 
    }]);
    if (error) return res.status(500).json(error);
    res.status(200).json({ success: true });
});

app.get('/api/bot-report', async (req, res) => {
    const { data } = await supabase.from('bot_logs').select('*').order('created_at', { ascending: false }).limit(20);
    res.json({ last_activities: data || [] });
});

app.listen(3001, () => console.log("🚀 Bridge Ready: http://localhost:3001"));