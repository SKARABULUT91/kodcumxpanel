/**
 * SNR ENGINE API Client - 1991 Edition
 * Path: 1991/src/lib/api-client.ts
 * Render üzerindeki Node.js/Express backend'e tam uyumlu bağlantı katmanı.
 */

const getBackendUrl = (): string => {
  // 1. Önce localStorage'da elle girilmiş (Ayarlar sayfasından) bir URL var mı bak
  const saved = localStorage.getItem('xmaster-backend-url');
  if (saved) return saved.replace(/\/$/, '');

  // 2. Varsayılan olarak senin çalışan RENDER adresini kullanıyoruz.
  return 'https://snr-engine-backend-1.onrender.com';
};

export const setBackendUrl = (url: string) => {
  localStorage.setItem('xmaster-backend-url', url.replace(/\/$/, ''));
};

export const getConfiguredBackendUrl = (): string => getBackendUrl();

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function apiCall<T = unknown>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'POST',
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  // KRİTİK DÜZENLEME: Backend app.post('/api/...') beklediği için 
  // tüm yolların başına otomatik /api ekliyoruz.
  const baseEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const apiPath = baseEndpoint.startsWith('/api') ? baseEndpoint : `/api${baseEndpoint}`;
  
  const url = `${getBackendUrl()}${apiPath}`;

  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    
    // Yanıtın JSON olup olmadığını güvenli şekilde kontrol et
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { message: text };
    }

    if (!res.ok) {
      return { 
        success: false, 
        error: data.error || data.message || `Bağlantı Hatası: ${res.status}` 
      };
    }
    
    return { success: true, data: data as T, message: data.message };
  } catch (err) {
    console.error("SNR ENGINE Bağlantı Hatası:", err);
    return { 
      success: false, 
      error: 'Bağlantı hatası - Render motoruna ulaşılamıyor!' 
    };
  }
}

// ===== Backend Durum Kontrolü (Sinyal aldığın yer) =====
export async function checkBackendStatus() {
  return apiCall<{ status: string }>('/bot-report', 'GET');
}

// ===== Bot Operasyon Başlatma / Durdurma =====
export async function startBotOperation(targetUrl?: string) {
  // Backend'in beklediği 'url' parametresini gövdeye ekliyoruz
  return apiCall('/start-bot', 'POST', { url: targetUrl });
}

export async function stopBotOperation() {
  return apiCall('/stop-bot', 'POST');
}

// ===== Auth / Session (X Hesap Girişleri) =====
export async function loginAccount(username: string, password: string, twoFASecret?: string, proxy?: string, userAgent?: string) {
  return apiCall('/auth/login', 'POST', { username, password, two_fa_secret: twoFASecret, proxy, user_agent: userAgent });
}

export async function logoutAccount(username: string) {
  return apiCall('/auth/logout', 'POST', { username });
}

export async function checkSession(username: string) {
  return apiCall('/auth/check-session', 'POST', { username });
}

// ===== Actions (Etkileşim Komutları) =====
export async function likeTweet(username: string, tweetId: string) {
  return apiCall('/actions/like', 'POST', { username, tweet_id: tweetId });
}

export async function retweetTweet(username: string, tweetId: string) {
  return apiCall('/actions/retweet', 'POST', { username, tweet_id: tweetId });
}

export async function postTweet(username: string, text: string, replyToId?: string) {
  return apiCall('/actions/tweet', 'POST', { username, text, reply_to_id: replyToId });
}

// ===== Proxy Kaydetme =====
export async function saveProxyConfig(host: string, port: string, user?: string, pass?: string) {
  return apiCall('/save-proxy', 'POST', { host, port, user, pass });
}

// ===== Veri / Scraping =====
export async function getTimeline(username: string, count = 20) {
  return apiCall<{ tweets: TweetData[] }>('/data/timeline', 'POST', { username, count });
}

export async function searchTweets(username: string, query: string, count = 20) {
  return apiCall<{ tweets: TweetData[] }>('/data/search', 'POST', { username, query, count });
}

// ===== Tipler (Interface) =====
export interface TweetData {
  id: string;
  text: string;
  created_at?: string;
  author_username?: string;
  author_name?: string;
}

export interface UserData {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}
