// C:\Users\SONER\Desktop\SNR_ENGINE_V2\frontend\src\integrations\supabase\client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Vite ortam değişkenlerini kontrol et
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn("Supabase URL veya Key eksik! .env dosyanızı kontrol edin.");
}

export const supabase = createClient<Database>(
  SUPABASE_URL || '', 
  SUPABASE_PUBLISHABLE_KEY || '', 
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);