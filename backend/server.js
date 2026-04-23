import { createClient } from '@supabase/supabase-js';
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Botundan gelen verileri karşılayan kapı
app.post('/api/bot-data', async (req, res) => {
    const { url, durum, bot_id, status } = req.body;
    console.log(`[SNR LOG]: ${durum}`);
    
    const { error } = await supabase.from('bot_logs').insert([{ 
        bot_id, target_url: url, durum, status, created_at: new Date().toISOString() 
    }]);

    if (error) return res.status(500).json(error);
    res.status(200).json({ success: true });
});

// Dashboard'un verileri çektiği kapı
app.get('/api/bot-report', async (req, res) => {
    const { data } = await supabase.from('bot_logs').select('*').order('created_at', { ascending: false }).limit(20);
    res.json({ last_activities: data || [] });
});

app.listen(3001, () => console.log("🚀 Sunucu 3001'de aktif."));